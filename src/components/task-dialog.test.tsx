// To avoid "An unhandled error occurred processing a request for the endpoint "getActivities"."

import {vi} from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { Provider } from 'react-redux';
import { configureTestStorePreloaded } from '../features/test-store'

import TaskDialog from './task-dialog';

const store = configureTestStorePreloaded({ user:{ id: 12 }});

test('initial value', async () => {
    
    const givenTask = { id:1, name:"test task", nextAction: "initial next action", url: "https://github.com/" };
    
    render( <Provider store={store}>
        <TaskDialog task={givenTask} oncancel={vi.fn()} onConfirm={vi.fn()}/>
    </Provider>);

    expect(screen.getByLabelText(/Première action à réaliser/i)).toHaveValue("initial next action");
    expect(screen.getByLabelText(/^Lien$/i)).toHaveValue("https://github.com/");
});



test('modifie un champ puis confirme : la tâche retournée contient la valeur saisie', async () => {
  const givenTask = {
    id: 1,
    title: 'initial title',
    nextAction: 'initial next action',
    url: 'initial url',
    slotExpr: 'this_month this_week mardi',
    activity: 2,
    status: 'à faire',
    favorite: false
  };

  const expectedTask = {    ...givenTask, nextAction: 'changed next action', url: 'changed url' };

  const onConfirm = vi.fn();

  render(
    <Provider store={store}>
      <TaskDialog task={givenTask} onCancel={vi.fn()} onConfirm={onConfirm} />
    </Provider>
  );

  // modifier le champ nextAction (label tel qu'utilisé dans le composant)
  const nextActionInput = screen.getByLabelText(/Première action à réaliser/i);
  fireEvent.change(nextActionInput, { target: { value: 'changed next action' } });

  const urlInput = screen.getByLabelText(/^Lien$/i);
  fireEvent.change(urlInput, { target: { value: 'changed url' } });

  // trouver le bouton de confirmation (essayer plusieurs libellés possibles)
  const confirmBtn = screen.getByRole('button', {
    name: /confirmer/i
  });

  fireEvent.click(confirmBtn);

  // attendre que le handler onConfirm soit appelé et vérifier la valeur
  await waitFor(() => expect(onConfirm).toHaveBeenCalled());

  expect(onConfirm).toHaveBeenCalledWith(expectedTask);
});

test('sans onDelete, le bouton Supprimer est absent', () => {
  const givenTask = { id: 1, title: 'test', nextAction: '', url: '' };
  render(<Provider store={store}><TaskDialog task={givenTask} onCancel={vi.fn()} onConfirm={vi.fn()} /></Provider>);
  expect(screen.queryByRole('button', { name: /supprimer/i })).not.toBeInTheDocument();
});

test('avec onDelete, clic Supprimer appelle onDelete avec la tâche courante', () => {
  const givenTask = { id: 1, title: 'test', nextAction: 'action', url: '' };
  const onDelete = vi.fn();
  render(<Provider store={store}><TaskDialog task={givenTask} onCancel={vi.fn()} onConfirm={vi.fn()} onDelete={onDelete} /></Provider>);
  fireEvent.click(screen.getByRole('button', { name: /supprimer/i }));
  expect(onDelete).toHaveBeenCalledWith(givenTask);
});

test('click on link', () => {
  const givenTask = {
    id: 1,
    title: 'initial title',
    nextAction: 'initial next action',
    url: 'https://gitbub.com/',
    slotExpr: 'this_month this_week mardi',
    activity: 2,
    status: 'à faire',
    favorite: false
  };
  render(
    <Provider store={store}>
      <TaskDialog task={givenTask} onCancel={vi.fn()} onConfirm={vi.fn()} />
    </Provider>
  );
  
  const link = screen.getByRole('link', { name: /Lien externe/i });

  expect(link).toHaveAttribute('href', 'https://gitbub.com/');
});