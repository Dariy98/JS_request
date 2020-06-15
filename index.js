const $app = document.querySelector(".todoapp");
const $todos = $app.querySelector(".todo-list");
const $footer = $app.querySelector(".footer");
const $filters = $app.querySelectorAll(".filters > li > a");
const $input = $app.querySelector(".new-todo");

function giveUrl(path) {
    let u = new URL(path, "https://fbopz.sse.codesandbox.io");
    return u
}

const templateTodo = ({ id, title, completed = false }) => {
  const className = completed ? "completed" : "";
  const checked = completed ? "checked" : "";
  return `<li class="${className}" data-todo-id="${id}">
            <div class="view">
                <input class="toggle" type="checkbox" ${checked} onclick = "toggleTodoCompl ()"/>
                <label ondblclick="updateTodo()">${title}</label>
                <button class="destroy" onclick = "deleteTodo()"></button>
            </div>
            <input type="text" class="edit" value="${title}" />
        </li>`;
};

const templateTodos = todos => {
  return todos.reduce((todos, todo) => {
    todos += templateTodo(todo);
    return todos;
  }, "");
};

const renderTodos = (todos = []) => {
  $todos.innerHTML = templateTodos(todos);
};

async function request(fn, link) {
    let u = fn(link)
    await fetch(u)
      .then(response => response.json())
      .then(data => renderTodos(data));
}
request(giveUrl, "/todos");

function deleteLinksClass() {
    $filters.forEach(link => {
        link.classList.remove("selected");
    });
}

$footer.addEventListener("click", event => {
    $filters.forEach((filter, index) => {
        if(event.target === filter) {
            event.preventDefault();
            deleteLinksClass();
            event.target.classList.add("selected");
            if(index === 1) request(giveUrl, "/todos?completed=false");
            if(index === 2) request(giveUrl, "/todos?completed=true");
            else request(giveUrl, "/todos");
        }
    })
})

function deleteTodo() {
    let id = event.target.parentNode.parentNode.dataset.todoId;
    let url = giveUrl(`/todos/${id}`);
    fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json"
        }
    }).then(response => response.json())
      .then(request(giveUrl, "/todos"))
}

$input.addEventListener("keydown", event => {
    if(event.keyCode === 13) {
        fetch(giveUrl("/todos"), {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: $input.value,
                completed: false
            })
        })
        .then(response => response.json())
        .then(request(giveUrl, "/todos"))
        .then($input.value = "")
    } 
})

function toggleTodoCompl () {
    let li = event.target.parentNode.parentNode;
    let id = li.dataset.todoId;
    let liClass = li.classList.contains("completed") ? li.classList.remove("completed") : li.classList.add("completed");
    let url = giveUrl(`/todos/${id}`)
    fetch(url, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            completed: !liClass
        })
    })
}

function updateTodo() {
    let li = event.target.parentNode.parentNode;
    let id = li.dataset.todoId;
    li.classList.add("editing");
    let url = giveUrl(`/todos/${id}`);
    let input2 = event.target.parentNode.nextElementSibling;
    input2.addEventListener("keydown", e => {
        if(e.keyCode === 13) {
            fetch(url, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: input2.value
                })
            })
            .then(response => response.json())
            .then(request(giveUrl, "/todos"));
            li.classList.remove("editing");
        }
    })
}

// function requestWithOptions (link, METHOD, obj) {
//     let u = giveUrl(link)
//     return fetch(u, {
//         method: METHOD,
//         headers: {
//             "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//             obj
//         })
//     })
// }