/*

Three type of node in our virtual DOM
      text nodes
      element nodes
      fragment nodes

*/

import { withoutNulls } from "../utils/arrays.mjs";

// import { withoutNulls } from "./utils/arrays";

export const DOM_TYPES = {
  TEXT: "text",
  ELEMENT: "element",
  FRAGMENT: "fragment",
};
mhkkjkk;

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

// Testing
const vDOM = h("form", { class: "login-form", action: "login" }, [
  h("input", { type: "text", name: "user" }),
  h("input", { type: "password", name: "pass" }),
  h("button", { on: { click: "login" } }, ["Login"]),
]);
console.log("virtual dom looks like this ");
console.dir(vDOM, { depth: null });
/*

Output will be 

{
  tag: 'form',
  props: { class: 'login-form', action: 'login' },
  children: [
    {
      tag: 'input',
      props: { type: 'text', name: 'user' },
      children: [],
      type: 'element'
    },
    {
      tag: 'input',
      props: { type: 'password', name: 'pass' },
      children: [],
      type: 'element'
    },
    {
      tag: 'button',
      props: { on: { click: 'login' } },
      children: [ { type: 'text', value: 'Login' } ],
      type: 'element'
    }
  ],
  type: 'element'
}

 and this virtual dom is for html

<form class="login-form" action="login">
        <input type="text" name="user">
        <input type="password" name="pass">
        <button>Login</button>
</form>







*/
