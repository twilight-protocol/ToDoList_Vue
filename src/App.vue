<template>
  <div class="todo-app">
    <div class="todo-app__container">
      <header class="todo-app__header">
        <h1 class="todo-app__title">待办事项</h1>
      </header>
      <section class="todo-app__card">
        <form class="todo-app__form" @submit="onAdd">
          <input
            type="text"
            maxlength="200"
            placeholder="添加新待办…"
            class="todo-app__input"
            autocomplete="off"
            v-model="newTodo"
          />
          <button type="submit" class="todo-app__add-btn">添加</button>
        </form>

        <nav class="todo-app__filters" role="tablist" aria-label="筛选待办">
          <button
            v-for="f in filters"
            :key="f.value"
            :class="[
              'filter-btn',
              'todo-app__filter-btn',
              { 'is-active': currentFilter === f.value },
            ]"
            @click="currentFilter = f.value"
            role="tab"
            :aria-selected="currentFilter === f.value"
          >
            {{ f.label }}
          </button>
        </nav>
        <nav
          class="todo-app__filters"
          role="tablist"
          aria-label="筛选待办"
        ></nav>

        <p class="todo-app__storage-hint">
          数据保存在浏览器
          <code class="todo-app__code">localStorage</code>
          键名
          <code class="todo-app__code">todos</code>
        </p>

        <ul ref="listRef" class="todo-app__list" aria-live="polite">
          <TodoItem
            v-for="todo in filteredTodos"
            :key="todo.id"
            :todo="todo"
            @toggle="store.toggle"
            @move="store.move"
            @delete="store.remove"
          />
        </ul>

        <p v-if="store.todos.length === 0" class="todo-app__empty-hint">
          暂无待办，输入后点击添加
        </p>
        <p v-else-if="filteredTodos.length === 0" class="todo-app__empty-hint">
          当前筛选下没有待办
        </p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import Sortable from "sortablejs";
import { useTodoStore } from "@/stores/todos";
import TodoItem from "@/components/TodoItem.vue";
const store = useTodoStore();
const newTodo = ref("");
const listRef = ref<HTMLElement | null>(null);
let sortableInstance: Sortable | null = null;

const currentFilter = ref<"all" | "active" | "completed">("all");
const filters = [
  { label: "全部", value: "all" as const },
  { label: "未完成", value: "active" as const },
  { label: "已完成", value: "completed" as const },
];

const filteredTodos = computed(() => {
  if (currentFilter.value === "active") return store.activeTodos;
  if (currentFilter.value === "completed") return store.completedTodos;
  return store.todos;
});

const onAdd = (e: Event) => {
  e.preventDefault();
  const text = newTodo.value.trim();
  if (!text) return;
  store.add(text);
  newTodo.value = "";
};

const initSortable = () => {
  if (!listRef.value) return;
  if (sortableInstance) sortableInstance.destroy();

  sortableInstance = new Sortable(listRef.value, {
    animation: 150,
    handle: ".todo-item__grip",
    ghostClass: "sortable-ghost",
    dragClass: "sortable-drag",
    disabled: currentFilter.value !== "all",
    onEnd: (evt) => {
      const { oldIndex, newIndex } = evt;
      if (oldIndex == null || newIndex == null || oldIndex === newIndex) return;
      const all = [...store.todos];
      const [moved] = all.splice(oldIndex, 1);
      all.splice(newIndex, 0, moved!);
      store.reorder(all);
    },
  });
};

watch(currentFilter, initSortable);
watch(
  () => store.todos.length,
  () => requestAnimationFrame(initSortable),
);

onMounted(initSortable);
</script>

<style scoped>
.todo-app {
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
}
.todo-app__container {
  max-width: 448px;
  margin: 0 auto;
  padding: 24px 16px;
}
@media (min-width: 640px) {
  .todo-app__container {
    padding-top: 40px;
    padding-bottom: 40px;
  }
}
.todo-app__header {
  margin-bottom: 24px;
  text-align: center;
}
.todo-app__title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
}
.todo-app__card {
  background: #fff;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
@media (min-width: 640px) {
  .todo-app__card {
    padding: 20px;
  }
}
.todo-app__form {
  display: flex;
  gap: 8px;
}
.todo-app__input {
  flex: 1;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid var(--slate-200);
  padding: 10px 12px;
  font-size: 16px;
  outline: none;
  background: #fff;
}
.todo-app__input:focus {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.25);
  border-color: transparent;
}
.todo-app__add-btn {
  min-height: 44px;
  min-width: 44px;
  flex: 0 0 auto;
  border: none;
  border-radius: 12px;
  background: var(--indigo-600);
  color: #fff;
  font-weight: 600;
  padding: 0 16px;
  cursor: pointer;
  transition:
    transform 120ms ease,
    background 120ms ease;
}
.todo-app__add-btn:hover {
  background: var(--indigo-700);
}
.todo-app__add-btn:active {
  background: var(--indigo-800);
  transform: scale(0.98);
}
.todo-app__filters {
  display: flex;
  gap: 8px;
}
.todo-app__filter-btn {
  flex: 1;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid var(--slate-200);
  background: var(--slate-50);
  color: var(--slate-700);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  cursor: pointer;
  border: none;
}
.todo-app__filter-btn.is-active {
  background: var(--indigo-600);
  color: #fff;
  border-color: var(--indigo-600);
}
.todo-app__storage-hint {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
}
.todo-app__code {
  color: var(--indigo-600);
  background: #eef2ff;
  padding: 0 4px;
  border-radius: 6px;
  font-size: 12px;
}
.todo-app__list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.todo-app__empty-hint {
  text-align: center;
  color: var(--muted);
  font-size: 14px;
  padding: 24px 0;
}
.todo-app__ai-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.todo-app__key-row {
  display: flex;
  gap: 8px;
}
.todo-app__key-input {
  flex: 1;
  min-height: 40px;
  border-radius: 10px;
  border: 1px solid var(--slate-200);
  padding: 8px 12px;
  font-size: 14px;
  outline: none;
  background: #fff;
}
.todo-app__key-input:focus {
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  border-color: var(--indigo-600);
}
.todo-app__key-save {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: none;
  background: var(--indigo-600);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}
.todo-app__key-save:hover {
  background: var(--indigo-700);
}
.todo-app__key-hint {
  margin: 0;
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.todo-app__key-change {
  background: none;
  border: none;
  color: var(--indigo-600);
  font-size: 12px;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}
</style>
