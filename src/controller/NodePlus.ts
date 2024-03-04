import {Node, Element, TextNode} from "parse5/dist/tree-adapters/default";

// Wrapper class for parse5 Node
export class NodePlus {
	private node: Node;

	constructor(node: Node) {
		this.node = node;
	}

	// Requires node to have text as its first child
	public getText(): string {
		const element = this.node as Element;
		return (element.childNodes[0] as TextNode).value.trim();
	}

	public getAttributes(): {[key: string]: string} {
		const attributes: {[key: string]: string} = {};
		(this.node as Element).attrs.forEach((attr) => {
			attributes[attr.name] = attr.value;
		});
		return attributes;
	}

	// My implementation of getElementsByClassName and getElementsByTagName using parse5
	// Recursively searches through the DOM tree to find elements with the given class name or tag name
	public getElementsBy(type: "className" | "tagName", value: string): NodePlus[] {
		let results: NodePlus[] = [];
		const element = this.node as Element;

		switch (type) {
			case "className":
				if (
					element.attrs &&
					element.attrs
						.find((attr) => attr.name === "class")
						?.value.split(" ")
						.includes(value)
				) {
					results.push(new NodePlus(element));
				}
				break;
			case "tagName":
				if (element.tagName === value) {
					results.push(new NodePlus(element));
				}
				break;
		}

		if (!element.childNodes) {
			return [];
		}

		element.childNodes.forEach((childNode) => {
			const nodePlus = new NodePlus(childNode);
			results = results.concat(nodePlus.getElementsBy(type, value));
		});

		return results;
	}
}
