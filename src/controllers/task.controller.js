import crypto from 'crypto';
import { pool } from '../db/connection.js';
import { taskDecorator } from '../decorators/task.decorator.js';

const getTaskTags = async (taskId) => {
  const [tags] = await pool.query(
    `SELECT t.* FROM tags t
     INNER JOIN tags_task tt ON t.id = tt.tag_id
     WHERE tt.task_id = ?`,
    [taskId]
  );
  return tags;
};

export const index = async (req, res) => {
  try {
    const [tasks] = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');

    if (tasks.length === 0) {
      return res.status(200).json({
        message: 'No hay registros de tareas',
        tasks: [],
        status: 200
      });
    }

    const formattedTasks = await Promise.all(
      tasks.map(async (task) => {
        const [categories] = await pool.query('SELECT * FROM categories WHERE id = ?', [task.category_id]);
        const tags = await getTaskTags(task.id);
        return taskDecorator(task, categories[0] || null, tags);
      })
    );

    return res.status(200).json({
      tasks: formattedTasks,
      status: 200
    });
  } catch (error) {
    console.error('Error al listar tareas:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor', status: 500 });
  }
};

export const store = async (req, res) => {
  try {
    const { title, description, status, category_id, user_id, tags } = req.body;

    if (!title || !category_id || !user_id) {
      return res.status(400).json({
        message: 'El título, la categoría y el usuario son requeridos',
        status: 400
      });
    }

    const newTaskId = crypto.randomUUID();
    const taskStatus = status || 'pending';

    await pool.query(
      'INSERT INTO tasks (id, title, description, status, category_id, user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [newTaskId, title, description || null, taskStatus, category_id, user_id]
    );

    if (Array.isArray(tags) && tags.length > 0) {
      for (const tagId of tags) {
        await pool.query('INSERT INTO tags_task (task_id, tag_id) VALUES (?, ?)', [newTaskId, tagId]);
      }
    }

    const [taskRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [newTaskId]);
    const [categoryRows] = await pool.query('SELECT * FROM categories WHERE id = ?', [category_id]);
    const attachedTags = await getTaskTags(newTaskId);

    return res.status(201).json({
      message: 'Tarea creada',
      task: taskDecorator(taskRows[0], categoryRows[0] || null, attachedTags),
      status: 201
    });
  } catch (error) {
    console.error('Error al crear tarea:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor', status: 500 });
  }
};

export const show = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length !== 36) {
      return res.status(400).json({
        message: 'El ID de la tarea debe tener exactamente 36 caracteres',
        status: 400
      });
    }

    const [taskRows] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (taskRows.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada', status: 404 });
    }

    const task = taskRows[0];
    const [categoryRows] = await pool.query('SELECT * FROM categories WHERE id = ?', [task.category_id]);
    const tags = await getTaskTags(id);

    return res.status(200).json({
      task: taskDecorator(task, categoryRows[0] || null, tags),
      status: 200
    });
  } catch (error) {
    console.error('Error al obtener tarea:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor', status: 500 });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, category_id, user_id, tags } = req.body;

    if (!id || id.trim().length !== 36) {
      return res.status(400).json({
        message: 'El ID de la tarea debe tener exactamente 36 caracteres',
        status: 400
      });
    }

    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada', status: 404 });
    }

    if (!title || !category_id || !user_id) {
      return res.status(400).json({
        message: 'El título, la categoría y el usuario son requeridos',
        status: 400
      });
    }

    await pool.query(
      'UPDATE tasks SET title = ?, description = ?, status = ?, category_id = ?, user_id = ? WHERE id = ?',
      [title, description || null, status || existing[0].status, category_id, user_id, id]
    );

    if (Array.isArray(tags)) {
      await pool.query('DELETE FROM tags_task WHERE task_id = ?', [id]);
      for (const tagId of tags) {
        await pool.query('INSERT INTO tags_task (task_id, tag_id) VALUES (?, ?)', [id, tagId]);
      }
    }

    const [updatedTask] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    const [categoryRows] = await pool.query('SELECT * FROM categories WHERE id = ?', [category_id]);
    const updatedTags = await getTaskTags(id);

    return res.status(200).json({
      message: 'Tarea actualizada',
      task: taskDecorator(updatedTask[0], categoryRows[0] || null, updatedTags),
      status: 200
    });
  } catch (error) {
    console.error('Error al actualizar tarea:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor', status: 500 });
  }
};

export const destroy = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim().length !== 36) {
      return res.status(400).json({
        message: 'El ID de la tarea debe tener exactamente 36 caracteres',
        status: 400
      });
    }

    const [existing] = await pool.query('SELECT * FROM tasks WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Tarea no encontrada', status: 404 });
    }

    await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    return res.status(200).json({
      message: 'Tarea eliminada',
      status: 200
    });
  } catch (error) {
    console.error('Error al eliminar tarea:', error.message);
    return res.status(500).json({ message: 'Error interno del servidor', status: 500 });
  }
};