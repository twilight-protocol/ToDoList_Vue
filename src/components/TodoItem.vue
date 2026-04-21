<template>
  <li class="todo-item" :data-id="todo.id">
    <span class="todo-item__grip" aria-label="拖动以排序" title="拖动以排序"
      >⋮⋮</span
    >
    <label class="todo-item__checkbox-wrap">
      <input
        type="checkbox"
        class="todo-item__checkbox"
        :checked="todo.completed"
        @change="emit('toggle', todo.id)"
      />
    </label>
    <span :class="['todo-item__text', { 'is-completed': todo.completed }]">
      {{ todo.text }}
    </span>
    <div class="todo-item__actions">
      <button
        aria-label="上移"
        class="todo-item__action-btn"
        @click="emit('move', todo.id, -1)"
      >
        ↑
      </button>
      <button
        aria-label="下移"
        class="todo-item__action-btn"
        @click="emit('move', todo.id, 1)"
      >
        ↓
      </button>
      <button
        aria-label="删除"
        class="todo-item__action-btn"
        @click="emit('delete', todo.id)"
      >
        删
      </button>
    </div>
  </li>
</template>

<script setup lang="ts">
import type { Todo } from "@/types";

defineProps<{
  todo: Todo;
}>();

const emit = defineEmits<{
  (e: "toggle", id: string): void;
  (e: "move", id: string, delta: number): void;
  (e: "delete", id: string): void;
}>();
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: stretch;
  gap: 8px;
  border: 1px solid #f1f5f9;
  background: rgba(248, 250, 252, 0.8);
  padding: 8px;
  border-radius: 12px;
  transition: box-shadow 120ms ease;
}
.todo-item.sortable-ghost {
  opacity: 0.4;
  background: #e0e7ff;
}
.todo-item.sortable-drag {
  opacity: 0.8;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.todo-item__grip {
  cursor: grab;
  user-select: none;
  min-width: 44px;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  line-height: 1;
  color: var(--muted);
  flex-shrink: 0;
}
.todo-item__grip:hover {
  color: var(--slate-600);
}
.todo-item__grip:active {
  cursor: grabbing;
}
.todo-item__checkbox-wrap {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-height: 44px;
  cursor: pointer;
}
.todo-item__checkbox {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  accent-color: var(--indigo-600);
}
.todo-item__text {
  flex: 1;
  align-self: center;
  word-break: break-word;
  padding: 2px 0;
  font-size: 16px;
  color: #0f172a;
}
.todo-item__text.is-completed {
  text-decoration: line-through;
  color: var(--muted);
}
.todo-item__actions {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}
@media (min-width: 640px) {
  .todo-item__actions {
    flex-direction: row;
  }
}
.todo-item__action-btn {
  min-height: 44px;
  min-width: 44px;
  border-radius: 10px;
  border: 1px solid var(--slate-200);
  background: #fff;
  color: var(--slate-600);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 0;
  transition:
    background 120ms ease,
    transform 120ms ease;
  display: flex;
  align-items: center;
  justify-content: center;
}
.todo-item__action-btn:hover {
  background: var(--slate-50);
}
.todo-item__action-btn:active {
  background: #eef2ff;
}
</style>
