const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface DeleteMeetingResponse {
  message: string;
  room_id: string;
}

/**
 * Delete a meeting room
 */
export const deleteMeeting = async (roomId: string): Promise<ApiResponse<DeleteMeetingResponse>> => {
  try {
    const response = await fetch(`${API_URL}/api/meetings/${roomId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data
    };
  } catch (error) {
    console.error('Error deleting meeting:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Check if a meeting room exists
 */
export const checkMeetingExists = async (roomId: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/api/meetings/${roomId}`, {
      method: 'HEAD',
    });
    return response.ok;
  } catch (error) {
    console.error('Error checking meeting existence:', error);
    return false;
  }
}; 