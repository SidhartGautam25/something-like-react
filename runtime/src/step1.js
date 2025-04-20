import { withoutNulls } from "./utils/arrays";

/*

Three type of node in our virtual DOM
      text nodes
      element nodes
      fragment nodes

*/

export const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
};

/*

=> Element Nodes
        -> they represent the regular HTML elements that you use to define the structure
        of your web pages.
        -> ex:  <h1> ,  <h6> , <p> , 
        ->  These nodes have a tag name (such as 'p'), attributes (such as a
            class name or the type attribute of an <input> element), and children nodes
            (the nodes that are inside of them, between the opening and closing tags).

*/

// function to create element nodes
// takes three argumnets
/*
        -> tag—the element’s tag name.
        -> props—an object with its attributes (that we’ll call props, for properties).
        -> children—an array of its children nodes

*/
// returns a virtual node object
export function h(tag, props = {}, children = []) {
  return {
    tag,
    props,
    children: mapTextNodes(withoutNulls(children)),
    type: DOM_TYPES.ELEMENT,
  };
  // using two functions mapTextNodes and withoutNulls
}

// this function transforms strings into text virtual nodes.
function mapTextNodes(children) {
  return children.map((child) =>
    typeof child === "string" ? hString(child) : child
  );
}

export function hString(str) {
  return { type: DOM_TYPES.TEXT, value: str };
}

//  A fragment is a type of virtual node used to group multiple nodes that need to
//  be attached to the DOM together, but don’t have a parent node in the DOM.
//  You can think of them as simply being a container for an array of virtual
//  nodes.

export function hFragment(vNodes) {
  return {
    type: DOM_TYPES.FRAGMENT,
    children: mapTextNodes(withoutNulls(vNodes)),
  };
}
