import Categoria from '../models/Categoria.js';

// Crear nueva categoría (solo admin)
export const CrearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion, color, icono } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre de la categoría es requerido' });
    }

    const categoria = await Categoria.create({
      nombre,
      descripcion,
      color: color || '#007bff',
      icono
    });

    res.status(201).json({
      message: 'Categoría creada exitosamente',
      categoria
    });
  } catch (error) {
    console.error('Error al crear categoría:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener todas las categorías
export const ObtenerCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { activo: true },
      order: [['nombre', 'ASC']]
    });

    res.json(categorias);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar categoría (solo admin)
export const ActualizarCategoria = async (req, res) => {
  try {
    const { categoria_id } = req.params;
    const { nombre, descripcion, color, icono } = req.body;

    const categoria = await Categoria.findByPk(categoria_id);

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await categoria.update({
      nombre: nombre || categoria.nombre,
      descripcion: descripcion !== undefined ? descripcion : categoria.descripcion,
      color: color || categoria.color,
      icono: icono !== undefined ? icono : categoria.icono
    });

    res.json({
      message: 'Categoría actualizada exitosamente',
      categoria
    });
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar categoría (solo admin)
export const EliminarCategoria = async (req, res) => {
  try {
    const { categoria_id } = req.params;

    const categoria = await Categoria.findByPk(categoria_id);

    if (!categoria) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await categoria.update({ activo: false });

    res.json({
      message: 'Categoría eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}; 