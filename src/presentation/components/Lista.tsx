import type { ReactNode } from 'react'
import { Icon } from './Icon'

export interface ListaColumna<T> {
  label: string
  render: (item: T) => ReactNode
}

interface ListaProps<T extends { id: string }> {
  titulo: string
  items: T[]
  columnas: ListaColumna<T>[]
  onCrear?: () => void
  onVer?: (item: T) => void
  onEditar?: (item: T) => void
  onEliminar?: (item: T) => void
  acciones?: (item: T) => ReactNode
  vacio?: string
}

export function Lista<T extends { id: string }>({
  titulo,
  items,
  columnas,
  onCrear,
  onVer,
  onEditar,
  onEliminar,
  acciones,
  vacio = 'No hay registros para mostrar.',
}: ListaProps<T>) {
  return (
    <section className="management-card">
      <header className="management-heading">
        <h2>{titulo}</h2>
        {onCrear && (
          <button type="button" className="primary-button" onClick={onCrear}>
            Crear nuevo
          </button>
        )}
      </header>
      {items.length === 0 ? (
        <p className="empty-state">{vacio}</p>
      ) : (
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                {columnas.map((columna) => (
                  <th key={columna.label} scope="col">
                    {columna.label}
                  </th>
                ))}
                <th scope="col">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  {columnas.map((columna) => (
                    <td key={columna.label}>{columna.render(item)}</td>
                  ))}
                  <td>
                    <div className="row-actions">
                      {onVer && (
                        <button
                          type="button"
                          className="icon-button"
                          aria-label="Ver"
                          title="Ver"
                          onClick={() => onVer(item)}
                        >
                          <Icon name="eye" />
                        </button>
                      )}
                      {onEditar && (
                        <button
                          type="button"
                          className="icon-button"
                          aria-label="Editar"
                          title="Editar"
                          onClick={() => onEditar(item)}
                        >
                          <Icon name="pencil" />
                        </button>
                      )}
                      {onEliminar && (
                        <button
                          type="button"
                          className="danger-button icon-button"
                          aria-label="Eliminar"
                          title="Eliminar"
                          onClick={() => onEliminar(item)}
                        >
                          <Icon name="trash" />
                        </button>
                      )}
                      {acciones?.(item)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
