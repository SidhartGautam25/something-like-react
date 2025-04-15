// Stage 1

// Step 1
// creating our kind of virtual node which we will insert into DOM
// using our _addElement function
let markup = {
  type: "article",
  children: [
    {
      type: "h2",
      children: [
        {
          type: "text",
          value: "counter",
        },
      ],
    },
  ],
};

/*

First we are building addElement Function




*/

// Step 2
// We are getting the main node so that we can insert our virtual node into it
const main = document.getElementById("app");

// Step 3
// _addElement is clone of addElement api of browser
function _addElemenet(pojoElement, parentDOMNode) {
  let newDOMNode =
    pojoElement.type === "text"
      ? document.createTextNode(pojoElement.value)
      : document.createElement(pojoElement.type);

  if (pojoElement.children) {
    pojoElement.children.forEach((child) => {
      _addElemenet(child, newDOMNode);
    });
  }

  parentDOMNode.appendChild(newDOMNode);
}

// Step 4
// when you visit server after this,you will see counter written on screen
// as we are inserting our markup into main using our _addElement function
_addElemenet(markup, main);
