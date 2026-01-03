import type { HuffmanNode } from './types';

export function createNode(
  frequency: number,
  char: string | null = null,
  left: HuffmanNode | null = null,
  right: HuffmanNode | null = null
): HuffmanNode {
  return { frequency, char, left, right };
}

export function isLeaf(node: HuffmanNode): boolean {
  return node.left === null && node.right === null;
}

export function buildHuffmanTree(frequencyMap: Map<string, number>): HuffmanNode | null {
  if (frequencyMap.size === 0) {
    return null;
  }

  if (frequencyMap.size === 1) {
    const [char, freq] = [...frequencyMap.entries()][0];
    const root = createNode(freq);
    root.left = createNode(freq, char);
    return root;
  }

  const nodes: HuffmanNode[] = [];
  frequencyMap.forEach((freq, char) => {
    nodes.push(createNode(freq, char));
  });

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.frequency - b.frequency);

    const left = nodes.shift()!;
    const right = nodes.shift()!;

    const merged = createNode(
      left.frequency + right.frequency,
      null,
      left,
      right
    );

    nodes.push(merged);
  }

  return nodes[0] || null;
}

export function generateCodes(
  root: HuffmanNode | null,
  prefix: string = '',
  codes: Map<string, string> = new Map()
): Map<string, string> {
  if (root === null) {
    return codes;
  }

  if (isLeaf(root) && root.char !== null) {
    codes.set(root.char, prefix || '0');
    return codes;
  }

  if (root.left) {
    generateCodes(root.left, prefix + '0', codes);
  }
  if (root.right) {
    generateCodes(root.right, prefix + '1', codes);
  }

  return codes;
}

export function serializeTree(node: HuffmanNode | null): string {
  if (!node) return '';

  const serialize = (n: HuffmanNode): object => {
    const result: Record<string, unknown> = {
      f: n.frequency,
    };
    if (n.char !== null) {
      result.c = n.char;
    }
    if (n.left) {
      result.l = serialize(n.left);
    }
    if (n.right) {
      result.r = serialize(n.right);
    }
    return result;
  };

  return JSON.stringify(serialize(node));
}

export function deserializeTree(data: string): HuffmanNode | null {
  if (!data) return null;

  const deserialize = (obj: Record<string, unknown>): HuffmanNode => {
    const node = createNode(
      obj.f as number,
      (obj.c as string) ?? null
    );
    if (obj.l) {
      node.left = deserialize(obj.l as Record<string, unknown>);
    }
    if (obj.r) {
      node.right = deserialize(obj.r as Record<string, unknown>);
    }
    return node;
  };

  try {
    const parsed = JSON.parse(data);
    return deserialize(parsed);
  } catch {
    return null;
  }
}
