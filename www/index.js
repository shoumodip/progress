"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function setClass(element, ...names) {
    element.classList.add(...names);
    return element;
}
function setClick(element, callback) {
    element.onclick = callback;
    return element;
}
function domMaybe(element, cond) {
    if (cond) {
        return element;
    }
    else {
        return undefined;
    }
}
function newInput(title, value, type) {
    const input = document.createElement("input");
    input.placeholder = title;
    input.value = value;
    if (type !== undefined) {
        input.type = type;
    }
    return input;
}
function newHeader(text, level) {
    const h1 = document.createElement("h" + level);
    h1.innerText = text;
    return h1;
}
function newButton(logo, click, compress) {
    const button = document.createElement("button");
    button.appendChild(logo);
    button.onclick = click;
    if (!compress) {
        return setClass(button, "stretch");
    }
    return button;
}
function newVertical(...children) {
    const div = setClass(document.createElement("div"), "vertical");
    div.replaceChildren(...children.filter((e) => e !== undefined));
    return div;
}
function newHorizontal(...children) {
    const div = setClass(document.createElement("div"), "horizontal");
    div.replaceChildren(...children.filter((e) => e !== undefined));
    return div;
}
function newPaddedPage(...children) {
    return setClass(newVertical(...children), "padding");
}
function newHeaderPanel(...children) {
    const div = setClass(document.createElement("div"), "header");
    div.replaceChildren(...children.filter((e) => e !== undefined));
    return div;
}
function newFloatingButton(logo, click, color) {
    const button = setClass(newButton(logo, click, true), "floating");
    button.style.backgroundColor = color;
    return button;
}
let activities;
let backSymbol;
let doneSymbol;
let editSymbol;
let plusSymbol;
let deleteSymbol;
function getDate() {
    return new Date().toLocaleDateString("en-GB");
}
function loadData() {
    const save = (localStorage["progress"] || "").split("\n");
    let i = 0;
    while (i < save.length) {
        const it = save[i++];
        if (it === "") {
            continue;
        }
        let activity = {
            log: [],
            name: it
        };
        while (i < save.length) {
            const it = save[i++];
            if (it === "") {
                break;
            }
            const parts = it.split(" ");
            activity.log.push({
                date: parts[1],
                value: Number(parts[0]),
            });
        }
        activities.push(activity);
    }
}
function saveData() {
    let data = "";
    for (const activity of activities) {
        data += `${activity.name}\n`;
        for (const item of activity.log) {
            data += `${item.value} ${item.date}\n`;
        }
        data += "\n";
    }
    localStorage["progress"] = data;
}
function renderSymbol(symbol, viewBox, size) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", `${size}rem`);
    svg.setAttribute("height", `${size}rem`);
    svg.setAttribute("viewBox", `0 0 ${viewBox} ${viewBox}`);
    svg.appendChild(symbol.cloneNode(true));
    return svg;
}
function renderLogItem(activity, item, index) {
    const isToday = item.date == getDate();
    return setClass(newHorizontal(setClass(newVertical(newHeader(String(item.value), 1), newHeader(item.date, 2)), "stretch"), domMaybe(newButton(renderSymbol(editSymbol, 50, 1.3), () => drawEditLogItemPage(activity, item), true), isToday), domMaybe(newButton(renderSymbol(deleteSymbol, 26, 1.3), () => {
        activity.log.splice(index, 1);
        saveData();
        drawActivityPage(activity);
    }, true), isToday)), "boxed");
}
function renderActivity(activity, index) {
    return setClass(newHorizontal(setClick(setClass(newHeader(activity.name, 1), "vcenter", "stretch"), () => drawActivityPage(activity)), newButton(renderSymbol(editSymbol, 50, 1.3), () => drawEditActivityPage(activity), true), newButton(renderSymbol(deleteSymbol, 26, 1.3), () => {
        activities.splice(index, 1);
        saveData();
        drawMainPage();
    }, true)), "boxed");
}
function drawEditLogItemPage(activity, item) {
    const input = newInput("Log Value", item ? String(item.value) : "", "number");
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton(renderSymbol(backSymbol, 24, 1.3), () => drawActivityPage(activity), true), setClass(input, "stretch"), newButton(renderSymbol(doneSymbol, 24, 1.5), () => {
        const value = Number(input.value);
        if (!value) {
            return;
        }
        if (item) {
            item.value = value;
        }
        else {
            activity.log.push({
                date: getDate(),
                value: value
            });
        }
        saveData();
        drawActivityPage(activity);
    }, true))));
}
function drawActivityPage(activity) {
    document.body.replaceChildren(newHeaderPanel(newButton(renderSymbol(backSymbol, 24, 1.3), drawMainPage, true), setClass(newHeader(activity.name, 1), "vcenter")), newPaddedPage(newVertical(...activity.log.map((item, index) => renderLogItem(activity, item, index)), newFloatingButton(renderSymbol(plusSymbol, 24, 2.5), () => drawEditLogItemPage(activity), "#1F6FB1"))));
}
function drawEditActivityPage(activity) {
    const input = newInput("Activity Name", activity ? activity.name : "");
    document.body.replaceChildren(newPaddedPage(newHorizontal(newButton(renderSymbol(backSymbol, 24, 1.3), drawMainPage, true), setClass(input, "stretch"), newButton(renderSymbol(doneSymbol, 24, 1.5), () => {
        if (input.value === "") {
            return;
        }
        if (activity) {
            activity.name = input.value;
        }
        else {
            activities.push({
                name: input.value,
                log: []
            });
        }
        saveData();
        drawMainPage();
    }, true))));
}
function drawMainPage() {
    document.body.replaceChildren(newPaddedPage(...activities.map(renderActivity), newFloatingButton(renderSymbol(plusSymbol, 24, 2.5), () => drawEditActivityPage(), "#1fb141")));
}
window.onload = () => __awaiter(void 0, void 0, void 0, function* () {
    activities = [];
    backSymbol = document.createElementNS("http://www.w3.org/2000/svg", "path");
    backSymbol.setAttribute("fill", "none");
    backSymbol.setAttribute("stroke", "#ffffff");
    backSymbol.setAttribute("stroke-linecap", "round");
    backSymbol.setAttribute("stroke-linejoin", "round");
    backSymbol.setAttribute("stroke-width", "2");
    backSymbol.setAttribute("d", "m15 19-7-7 7-7");
    doneSymbol = document.createElementNS("http://www.w3.org/2000/svg", "path");
    backSymbol.setAttribute("fill", "none");
    doneSymbol.setAttribute("stroke", "#1fb141");
    doneSymbol.setAttribute("stroke-linecap", "round");
    doneSymbol.setAttribute("stroke-linejoin", "round");
    doneSymbol.setAttribute("stroke-width", "2");
    doneSymbol.setAttribute("d", "M5 11.917 9.724 16.5 19 7.5");
    editSymbol = document.createElementNS("http://www.w3.org/2000/svg", "path");
    editSymbol.setAttribute("fill", "#ffffff");
    editSymbol.setAttribute("d", "M 46.574219 3.425781 C 45.625 2.476563 44.378906 2 43.132813 2 C 41.886719 2 40.640625 2.476563 39.691406 3.425781 C 39.691406 3.425781 39.621094 3.492188 39.53125 3.585938 C 39.523438 3.59375 39.511719 3.597656 39.503906 3.605469 L 4.300781 38.804688 C 4.179688 38.929688 4.089844 39.082031 4.042969 39.253906 L 2.035156 46.742188 C 1.941406 47.085938 2.039063 47.453125 2.292969 47.707031 C 2.484375 47.898438 2.738281 48 3 48 C 3.085938 48 3.171875 47.988281 3.257813 47.964844 L 10.746094 45.957031 C 10.917969 45.910156 11.070313 45.820313 11.195313 45.695313 L 46.394531 10.5 C 46.40625 10.488281 46.410156 10.472656 46.417969 10.460938 C 46.507813 10.371094 46.570313 10.308594 46.570313 10.308594 C 48.476563 8.40625 48.476563 5.324219 46.574219 3.425781 Z M 45.160156 4.839844 C 46.277344 5.957031 46.277344 7.777344 45.160156 8.894531 C 44.828125 9.222656 44.546875 9.507813 44.304688 9.75 L 40.25 5.695313 C 40.710938 5.234375 41.105469 4.839844 41.105469 4.839844 C 41.644531 4.296875 42.367188 4 43.132813 4 C 43.898438 4 44.617188 4.300781 45.160156 4.839844 Z M 5.605469 41.152344 L 8.847656 44.394531 L 4.414063 45.585938 Z");
    plusSymbol = document.createElementNS("http://www.w3.org/2000/svg", "path");
    plusSymbol.setAttribute("stroke", "#181818");
    plusSymbol.setAttribute("stroke-linecap", "round");
    plusSymbol.setAttribute("stroke-linejoin", "round");
    plusSymbol.setAttribute("stroke-width", "2");
    plusSymbol.setAttribute("d", "M5 12h14m-7 7V5");
    deleteSymbol = document.createElementNS("http://www.w3.org/2000/svg", "path");
    deleteSymbol.setAttribute("fill", "#ff3b30");
    deleteSymbol.setAttribute("d", "M 11 -0.03125 C 10.164063 -0.03125 9.34375 0.132813 8.75 0.71875 C 8.15625 1.304688 7.96875 2.136719 7.96875 3 L 4 3 C 3.449219 3 3 3.449219 3 4 L 2 4 L 2 6 L 24 6 L 24 4 L 23 4 C 23 3.449219 22.550781 3 22 3 L 18.03125 3 C 18.03125 2.136719 17.84375 1.304688 17.25 0.71875 C 16.65625 0.132813 15.835938 -0.03125 15 -0.03125 Z M 11 2.03125 L 15 2.03125 C 15.546875 2.03125 15.71875 2.160156 15.78125 2.21875 C 15.84375 2.277344 15.96875 2.441406 15.96875 3 L 10.03125 3 C 10.03125 2.441406 10.15625 2.277344 10.21875 2.21875 C 10.28125 2.160156 10.453125 2.03125 11 2.03125 Z M 4 7 L 4 23 C 4 24.652344 5.347656 26 7 26 L 19 26 C 20.652344 26 22 24.652344 22 23 L 22 7 Z M 8 10 L 10 10 L 10 22 L 8 22 Z M 12 10 L 14 10 L 14 22 L 12 22 Z M 16 10 L 18 10 L 18 22 L 16 22 Z");
    document.fonts.add(new FontFace("No Continue", "url('fonts/NoContinue.ttf')"));
    yield document.fonts.ready;
    loadData();
    drawMainPage();
});
