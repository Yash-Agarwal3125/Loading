import { useStore } from '../state/store.jsx'
import TaskCard from '../components/TaskCard.jsx'

/**
 * Tasks
 * Block 8. Today's schedule with inline predicted ETA and contributor breakdown on expand.
 * Read docs/PRD.md for acceptance criteria before building.
 */
export default function Tasks() {
  const { state } = useStore()

  return (
    <div className="space-y-3 p-4">
      <h1 className="text-2xl text-concrete-100">Tasks</h1>
      {state.tasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
