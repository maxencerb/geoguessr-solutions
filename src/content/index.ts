import { mount } from "svelte";
import Content from "./content.svelte";
import "./main.css";

const root = document.createElement("div");
root.id = "geoguessr-solutions-content";
document.body.appendChild(root);

export const content = mount(Content, {
  target: root,
});