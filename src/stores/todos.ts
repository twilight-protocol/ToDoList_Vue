import { ref, computed, watch } from "vue";
import { defineStore } from "pinia";
import type { Todo } from "@/types";

const STORAGE_KEY = "todos";

function load(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (t: any) =>
        t &&
        typeof t.id === "string" &&
        typeof t.text === "string" &&
        typeof t.completed === "boolean",
    );
  } catch {
    return [];
  }
}

function save(todos: Todo[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    console.warn("本地存储受限");
  }
}

export const useTodoStore = defineStore("todos", () => {
  // State
  const todos = ref<Todo[]>(load());

  // 自动持久化
  watch(todos, (val) => save(val), { deep: true });

  // Getters
  const activeTodos = computed(() => todos.value.filter((t) => !t.completed));
  const completedTodos = computed(() => todos.value.filter((t) => t.completed));

  // Actions
  const add = (text: string) => {
    todos.value.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      text,
      completed: false,
    });
  };

  const toggle = (id: string) => {
    const todo = todos.value.find((t) => t.id === id);
    if (todo) todo.completed = !todo.completed;
  };

  const move = (id: string, delta: number) => {
    const i = todos.value.findIndex((t) => t.id === id);
    if (i < 0) return;
    const j = i + delta;
    if (j < 0 || j >= todos.value.length) return;
    const all = [...todos.value];
    const [moved] = all.splice(i, 1);
    all.splice(j, 0, moved!);
    todos.value = all;
  };

  const remove = (id: string) => {
    todos.value = todos.value.filter((t) => t.id !== id);
  };

  const reorder = (newOrder: Todo[]) => {
    todos.value = newOrder;
  };

  return {
    todos,
    activeTodos,
    completedTodos,
    add,
    toggle,
    move,
    remove,
    reorder,
  };
});
