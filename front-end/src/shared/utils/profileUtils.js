/**
 * Profile Utility Functions
 * Provides validation, file handling, and user data management for the admin profile page
 */

const LS_USERS = "fyd_users";
const LS_SESSION = "fyd_session";

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validates a name input
 * @param {string} name - The name to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateName(name) {
  if (!name || name.trim().length === 0) {
    return {
      valid: false,
      error: name === "" ? "Tên không được để trống" : "Tên không được chỉ chứa khoảng trắng"
    };
  }
  return { valid: true };
}

/**
 * Validates a password input
 * @param {string} password - The password to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validatePassword(password) {
  if (!password || password.trim().length === 0) {
    return {
      valid: false,
      error: password === "" ? "Mật khẩu không được để trống" : "Mật khẩu không được chỉ chứa khoảng trắng"
    };
  }
  return { valid: true };
}

/**
 * Validates that two passwords match
 * @param {string} password - The first password
 * @param {string} confirmPassword - The confirmation password
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validatePasswordMatch(password, confirmPassword) {
  if (password !== confirmPassword) {
    return {
      valid: false,
      error: "Mật khẩu mới và xác nhận không khớp"
    };
  }
  return { valid: true };
}

/**
 * Validates that a file is an image
 * @param {File} file - The file to validate
 * @returns {{valid: boolean, error?: string}} Validation result
 */
export function validateImageFile(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (!file || !file.type) {
    return {
      valid: false,
      error: "File không hợp lệ"
    };
  }
  
  if (!validTypes.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: "Vui lòng chọn file ảnh (jpg, png, gif, webp)"
    };
  }
  
  return { valid: true };
}

// ============================================================================
// File Handling
// ============================================================================

/**
 * Converts a file to a data URL
 * @param {File} file - The file to convert
 * @returns {Promise<string>} Promise that resolves to a data URL
 */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error("Không thể đọc file ảnh"));
    };
    
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// User Data Management
// ============================================================================

/**
 * Gets a user from localStorage by ID
 * @param {string} userId - The user ID to look up
 * @returns {Object|null} The user object or null if not found
 */
export function getUserFromStorage(userId) {
  try {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    const user = users.find(u => u.id === userId);
    return user || null;
  } catch (error) {
    console.error("Error reading user from storage:", error);
    return null;
  }
}

/**
 * Updates a user in localStorage
 * @param {string} userId - The user ID to update
 * @param {Object} updates - The fields to update
 * @returns {boolean} True if successful, false otherwise
 */
export function updateUserInStorage(userId, updates) {
  try {
    const users = JSON.parse(localStorage.getItem(LS_USERS) || "[]");
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      console.error("User not found in storage");
      return false;
    }
    
    // Update the user with new data
    users[userIndex] = { ...users[userIndex], ...updates };
    
    // Save back to localStorage
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    
    return true;
  } catch (error) {
    console.error("Error updating user in storage:", error);
    return false;
  }
}

/**
 * Updates the current session in localStorage
 * @param {Object} updates - The session fields to update
 * @returns {void}
 */
export function updateSession(updates) {
  try {
    const session = JSON.parse(localStorage.getItem(LS_SESSION));
    
    if (!session) {
      console.error("No session found");
      return;
    }
    
    // Update session with new data
    const updatedSession = { ...session, ...updates };
    
    // Save back to localStorage
    localStorage.setItem(LS_SESSION, JSON.stringify(updatedSession));
  } catch (error) {
    console.error("Error updating session:", error);
  }
}

// ============================================================================
// Date Formatting
// ============================================================================

/**
 * Formats a timestamp to a readable date string
 * @param {number} timestamp - The timestamp to format
 * @returns {string} Formatted date string
 */
export function formatDate(timestamp) {
  try {
    // Check for null, undefined, or invalid input
    if (timestamp == null || timestamp === '') {
      return "Ngày không hợp lệ";
    }
    
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Ngày không hợp lệ";
    }
    
    // Format as "DD/MM/YYYY"
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Ngày không hợp lệ";
  }
}
