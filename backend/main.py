import os
import base64
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional
from supabase import create_client, Client

from huffman import HuffmanEncoder, HuffmanDecoder

app = FastAPI(title="Huffman Encoder/Decoder API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

supabase_url = os.environ.get("SUPABASE_URL", "")
supabase_key = os.environ.get("SUPABASE_ANON_KEY", "")
supabase: Optional[Client] = None

if supabase_url and supabase_key:
    supabase = create_client(supabase_url, supabase_key)


class TextInput(BaseModel):
    text: str


class EncodeResponse(BaseModel):
    encodedData: str
    statistics: dict
    analysis: list
    treeStructure: dict | None
    sessionId: str | None


class DecodeResponse(BaseModel):
    decodedText: str
    statistics: dict


class AnalyzeResponse(BaseModel):
    analysis: list
    treeStructure: dict | None
    codes: dict


@app.post("/api/analyze", response_model=AnalyzeResponse)
async def analyze_text(input_data: TextInput):
    if not input_data.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    encoder = HuffmanEncoder()
    encoder.build_from_text(input_data.text)

    return AnalyzeResponse(
        analysis=encoder.get_analysis(),
        treeStructure=encoder.get_tree_structure(),
        codes=encoder.codes
    )


@app.post("/api/analyze-file")
async def analyze_file(file: UploadFile = File(...)):
    content = await file.read()
    try:
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be a valid UTF-8 text file")

    encoder = HuffmanEncoder()
    encoder.build_from_text(text)

    return AnalyzeResponse(
        analysis=encoder.get_analysis(),
        treeStructure=encoder.get_tree_structure(),
        codes=encoder.codes
    )


@app.post("/api/encode", response_model=EncodeResponse)
async def encode_text(input_data: TextInput):
    if not input_data.text:
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    encoder = HuffmanEncoder()
    encoded_bytes = encoder.encode(input_data.text)
    statistics = encoder.get_statistics(input_data.text, encoded_bytes)

    session_id = None
    if supabase:
        try:
            result = supabase.table("encoding_sessions").insert({
                "original_size": statistics["originalSize"],
                "encoded_size": statistics["encodedSize"],
                "compression_ratio": statistics["compressionRatio"],
                "unique_chars": statistics["uniqueChars"],
                "operation_type": "encode"
            }).execute()
            if result.data:
                session_id = result.data[0]["id"]
        except Exception:
            pass

    return EncodeResponse(
        encodedData=base64.b64encode(encoded_bytes).decode('ascii'),
        statistics=statistics,
        analysis=encoder.get_analysis(),
        treeStructure=encoder.get_tree_structure(),
        sessionId=session_id
    )


@app.post("/api/encode-file")
async def encode_file(file: UploadFile = File(...)):
    content = await file.read()
    try:
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be a valid UTF-8 text file")

    encoder = HuffmanEncoder()
    encoded_bytes = encoder.encode(text)
    statistics = encoder.get_statistics(text, encoded_bytes)

    session_id = None
    if supabase:
        try:
            result = supabase.table("encoding_sessions").insert({
                "original_filename": file.filename,
                "original_size": statistics["originalSize"],
                "encoded_size": statistics["encodedSize"],
                "compression_ratio": statistics["compressionRatio"],
                "unique_chars": statistics["uniqueChars"],
                "operation_type": "encode"
            }).execute()
            if result.data:
                session_id = result.data[0]["id"]
        except Exception:
            pass

    return EncodeResponse(
        encodedData=base64.b64encode(encoded_bytes).decode('ascii'),
        statistics=statistics,
        analysis=encoder.get_analysis(),
        treeStructure=encoder.get_tree_structure(),
        sessionId=session_id
    )


@app.post("/api/decode", response_model=DecodeResponse)
async def decode_data(input_data: TextInput):
    try:
        encoded_bytes = base64.b64decode(input_data.text)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid base64 encoded data")

    decoder = HuffmanDecoder()
    try:
        decoded_text = decoder.decode(encoded_bytes)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    statistics = decoder.get_statistics(encoded_bytes, decoded_text)

    if supabase:
        try:
            supabase.table("encoding_sessions").insert({
                "original_size": statistics["decodedSize"],
                "encoded_size": statistics["encodedSize"],
                "compression_ratio": statistics["compressionRatio"],
                "operation_type": "decode"
            }).execute()
        except Exception:
            pass

    return DecodeResponse(
        decodedText=decoded_text,
        statistics=statistics
    )


@app.post("/api/decode-file")
async def decode_file(file: UploadFile = File(...)):
    content = await file.read()

    decoder = HuffmanDecoder()
    try:
        decoded_text = decoder.decode(content)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    statistics = decoder.get_statistics(content, decoded_text)

    if supabase:
        try:
            supabase.table("encoding_sessions").insert({
                "original_filename": file.filename,
                "original_size": statistics["decodedSize"],
                "encoded_size": statistics["encodedSize"],
                "compression_ratio": statistics["compressionRatio"],
                "operation_type": "decode"
            }).execute()
        except Exception:
            pass

    return DecodeResponse(
        decodedText=decoded_text,
        statistics=statistics
    )


@app.get("/api/history")
async def get_history(limit: int = 20):
    if not supabase:
        return {"sessions": []}

    try:
        result = supabase.table("encoding_sessions")\
            .select("*")\
            .order("created_at", desc=True)\
            .limit(limit)\
            .execute()
        return {"sessions": result.data}
    except Exception:
        return {"sessions": []}


@app.delete("/api/history/{session_id}")
async def delete_session(session_id: str):
    if not supabase:
        raise HTTPException(status_code=400, detail="Database not configured")

    try:
        supabase.table("encoding_sessions").delete().eq("id", session_id).execute()
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
