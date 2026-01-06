# Huffman Encoder & Decoder

A full-stack web application for encoding and decoding text using Huffman coding algorithm. Built with React + TypeScript frontend and FastAPI Python backend.

## 🚀 Features

- **Text Encoding**: Convert text to compressed Huffman-encoded binary data
- **Text Decoding**: Decode Huffman-encoded data back to original text
- **File Support**: Upload and process text files
- **Huffman Tree Visualization**: View the generated Huffman tree structure
- **Code Table**: Display character frequency and Huffman codes
- **Compression Statistics**: See compression ratio, original size, and compressed size
- **Operation Logs**: Track all encoding/decoding operations

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS

### Backend
- Python 3
- FastAPI
- Uvicorn

## 📦 Installation

### Prerequisites
- Node.js (v18 or higher)
- Python (v3.9 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd project/backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the backend server:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the project directory:
   ```bash
   cd project
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

## 🎯 Usage

1. **Encode Text**:
   - Enter text in the input area or upload a text file
   - Click "Encode" to compress the text
   - View the encoded output, compression statistics, and Huffman tree

2. **Decode Text**:
   - Paste the encoded data or upload an encoded file
   - Click "Decode" to restore the original text
   - View the decoded output and statistics

3. **Analyze**:
   - Use the "Analyze" feature to view character frequencies and Huffman codes without encoding

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze text and return Huffman codes |
| `/api/analyze-file` | POST | Analyze uploaded file |
| `/api/encode` | POST | Encode text using Huffman coding |
| `/api/encode-file` | POST | Encode uploaded file |
| `/api/decode` | POST | Decode Huffman-encoded data |
| `/api/decode-file` | POST | Decode uploaded file |
| `/api/health` | GET | Health check endpoint |

## 🧮 How Huffman Coding Works

Huffman coding is a lossless data compression algorithm that:

1. **Frequency Analysis**: Counts the frequency of each character in the input
2. **Tree Building**: Creates a binary tree where frequent characters have shorter codes
3. **Code Generation**: Assigns variable-length binary codes to each character
4. **Encoding**: Replaces each character with its binary code
5. **Decoding**: Uses the same tree to restore the original text

## 📁 Project Structure

```
project/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── requirements.txt     # Python dependencies
│   └── huffman/
│       ├── __init__.py
│       ├── encoder.py       # Huffman encoding logic
│       ├── decoder.py       # Huffman decoding logic
│       ├── tree.py          # Huffman tree implementation
│       └── analyzer.py      # Text analysis utilities
├── src/
│   ├── App.tsx              # Main React component
│   ├── main.tsx             # React entry point
│   ├── components/          # React components
│   └── lib/
│       └── huffman/         # Frontend Huffman utilities
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

Course Design Project - Huffman Encoder and Decoder
Md Myan Uddin 
NJUPT
