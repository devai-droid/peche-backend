/**
 * Enum representing different types of buildings in the system.
 * Each building is identified by a unique string value.
 */
export enum Building {
  BUILDING_1 = "BUILDING_1",
  BUILDING_2 = "BUILDING_2",
  BUILDING_3 = "BUILDING_3",
}

export enum LangCategoryStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

/**
 * Sorts an array of buildings based on a priority list.
 * Buildings that appear in the priority list are sorted first, in the order they appear in the priority list.
 * Buildings that don't appear in the priority list are placed at the end, maintaining their relative order.
 *
 * @param availableBuildings - Array of buildings to be sorted
 * @param priorityBuildings - Array of buildings defining the priority order
 * @returns A new sorted array of buildings
 */
export function sortBuildingsByPriority(availableBuildings: Building[], priorityBuildings: Building[]): Building[] {
  const newOrder = [...priorityBuildings]
  // const third = [Building.BUILDING_1, Building.BUILDING_2, Building.BUILDING_3].find((it) =>
  const third = [Building.BUILDING_1].find((it) => priorityBuildings.map((building) => it != building))
  newOrder.push(third)

  return [...availableBuildings].sort((a, b) => {
    const indexA = newOrder.indexOf(a)
    const indexB = newOrder.indexOf(b)

    if (indexA === -1 && indexB === -1) return 0
    if (indexA === -1) return 1
    if (indexB === -1) return -1

    return indexA - indexB
  })
}
