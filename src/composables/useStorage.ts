// composables/useStorage.ts
import { ref, onMounted, onUnmounted } from "vue";
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

const todosRef = ref<Todo[]>(load());

export default function useStorage() {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      todosRef.value = load();
    }
  };

  onMounted(() => {
    window.addEventListener("storage", onStorage);
  });
  onUnmounted(() => {
    window.removeEventListener("storage", onStorage);
  });

  const add = (text: string) => {
    const all = [...todosRef.value];
    all.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      text,
      completed: false,
    });
    save(all);
    todosRef.value = all;
  };

  const toggle = (id: string) => {
    const all = todosRef.value.map((t) =>
      t.id === id ? { ...t, completed: !t.completed } : t,
    );
    save(all);
    todosRef.value = all;
  };

  const move = (id: string, delta: number) => {
    const all = [...todosRef.value];
    const i = all.findIndex((t) => t.id === id);
    if (i < 0) return;
    const j = i + delta;
    if (j < 0 || j >= all.length) return;
    const a = all[i]!;
    const b = all[j]!;
    all[i] = b;
    all[j] = a;
    save(all);
    todosRef.value = all;
  };

  const remove = (id: string) => {
    const all = todosRef.value.filter((t) => t.id !== id);
    save(all);
    todosRef.value = all;
  };

  // 新增：拖拽排序
  const reorder = (newOrder: Todo[]) => {
    save(newOrder);
    todosRef.value = newOrder;
  };

  return {
    todos: todosRef,
    add,
    toggle,
    move,
    remove,
    reorder,
  };
}
