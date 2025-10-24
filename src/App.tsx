/* eslint-disable max-len */
import React, { useEffect, useMemo, useState } from 'react';
import 'bulma/css/bulma.css';
import '@fortawesome/fontawesome-free/css/all.css';

import { TodoList } from './components/TodoList';
import { TodoFilter } from './components/TodoFilter';
import { TodoModal } from './components/TodoModal';
import { Loader } from './components/Loader';
import { getTodos } from './api';
import { Todo } from './types/Todo';
import { FilterStatus } from './types/FilterStatus';

const FILTRATIONS: Record<FilterStatus, (todo: Todo) => boolean> = {
  [FilterStatus.All]: () => true,
  [FilterStatus.Active]: (todo: Todo) => !todo.completed,
  [FilterStatus.Completed]: (todo: Todo) => todo.completed,
};

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isModalOpened, setIsModalOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterStatus>(
    FilterStatus.All,
  );

  useEffect(() => {
    const fetchTodos = async () => {
      setIsLoading(true);
      try {
        setTodos(await getTodos());
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodos();
  }, []);

  const filteredTodos = useMemo(() => {
    const normalized = searchQuery.toLowerCase().trim();

    return todos
      .filter(FILTRATIONS[selectedFilter])
      .filter(todo => todo.title.toLowerCase().includes(normalized));
  }, [todos, searchQuery, selectedFilter]);

  return (
    <>
      <section className="section">
        <div className="container box">
          <h1 className="title">Todos:</h1>

          <TodoFilter
            query={searchQuery}
            handleQueryChange={e => setSearchQuery(e.target.value)}
            handleQueryReset={() => setSearchQuery('')}
            selectedFilter={selectedFilter}
            handleSelectFilter={e =>
              setSelectedFilter(e.target.value as FilterStatus)
            }
          />

          {isLoading ? (
            <Loader />
          ) : (
            <TodoList
              todos={filteredTodos}
              selectedTodo={selectedTodo}
              handleSelectTodo={todo => {
                setSelectedTodo(todo);
                setIsModalOpened(true);
              }}
            />
          )}
        </div>
      </section>

      {isModalOpened && selectedTodo && (
        <TodoModal
          handleModalClose={() => {
            setIsModalOpened(false);
            setSelectedTodo(null);
          }}
          selectedTodo={selectedTodo}
        />
      )}
    </>
  );
};
