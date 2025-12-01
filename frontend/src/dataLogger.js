/**
 * Saves a new data event to localStorage.
 * @param {object} event - The data to save (e.g., { type: 'mood', value: 'Positive' })
 */
export const saveData = (event) => {
  try {
    // 1. Get existing data, or an empty array
    const existingData = JSON.parse(localStorage.getItem("mirrorMindData")) || [];
    
    // 2. Add the new event with a timestamp
    const newEvent = { 
      ...event, 
      timestamp: new Date().toISOString() 
    };

    // 3. Add new event and save
    existingData.push(newEvent);
    localStorage.setItem("mirrorMindData", JSON.stringify(existingData));
    
  } catch (error) {
    console.error("Failed to save data to localStorage:", error);
  }
};

/**
 * Loads all data from localStorage.
 * @returns {Array} - An array of all saved data events.
 */
export const loadData = () => {
  try {
    return JSON.parse(localStorage.getItem("mirrorMindData")) || [];
  } catch (error) {
    console.error("Failed to load data from localStorage:", error);
    return [];
  }
};