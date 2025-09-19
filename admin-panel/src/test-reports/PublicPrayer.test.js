import React from 'react';
import { render, screen, fireEvent, waitFor, act, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import PrayerHub from '../pages/PublicPrayers';
import { useUser } from '../context/UserContext';

// Mock the UserContext
jest.mock('../context/UserContext', () => ({
  useUser: jest.fn()
}));

// Mock the PageLoader component
jest.mock('../components/PageLoader', () => {
  return function MockPageLoader({ open }) {
    return open ? <div data-testid="page-loader">Loading...</div> : null;
  };
});

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('PrayerHub Component', () => {
  const mockUser = {
    id: 1,
    role: 1,
    first_name: 'Test',
    last_name: 'User'
  };

  const mockCategoriesResponse = {
    status: 200,
    data: {
      categories: [
        { id: 1, name: 'Super Admin Category2' },
        { id: 2, name: 'Super Admin Category4' },
        { id: 3, name: 'Health' }
      ],
      organisations: [
        { id: 1, org_name: 'Test Organization' },
        { id: 2, org_name: 'Another Organization' }
      ],
      activeprayerscount: 5,
      pendingprayerscount: 3,
      answeredprayerscount: 10,
      rejectedprayerscount: 2
    }
  };

  const mockPrayerListResponse = {
    status: 200,
    data: [
      {
        id: 1,
        title: 'Test Prayer Request',
        description: 'Please pray for healing',
        is_approved: '0',
        created_at: '2024-01-01T10:00:00Z',
        app_users: {
          first_name: 'John',
          last_name: 'Doe'
        },
        categories: {
          name: 'Health'
        },
        importance: 'high'
      },
      {
        id: 2,
        title: 'Another Prayer Request',
        description: 'Pray for guidance',
        is_approved: '1',
        created_at: '2024-01-02T10:00:00Z',
        app_users: {
          first_name: 'Jane',
          last_name: 'Smith'
        },
        categories: {
          name: 'Guidance'
        },
        importance: 'medium'
      }
    ],
    pagination: {
      totalPages: 1
    }
  };

  beforeEach(() => {
    // Reset mocks
    fetch.mockReset();
    mockLocalStorage.getItem.mockReset();
    useUser.mockReturnValue({ user: mockUser });
    
    // Mock localStorage token
    mockLocalStorage.getItem.mockReturnValue('mock-token');

    // Setup default fetch responses
    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategoriesResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrayerListResponse
      });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders stats cards after loading', async () => {
    await act(async () => {
      render(<PrayerHub />);
    });

    // Wait for loading to complete and stats to appear
    await waitFor(() => {
      expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
    });

    // Check for stats cards
    await waitFor(() => {
      expect(screen.getByText('Active Prayers')).toBeInTheDocument();
      expect(screen.getByText('Pending Prayers')).toBeInTheDocument();
      expect(screen.getByText('Answered Prayers')).toBeInTheDocument();
      expect(screen.getByText('Cancelled Prayers')).toBeInTheDocument();
    });

    // Check for stats counts
    expect(screen.getByText('5')).toBeInTheDocument(); // Active prayers
    expect(screen.getByText('3')).toBeInTheDocument(); // Pending prayers
    expect(screen.getByText('10')).toBeInTheDocument(); // Answered prayers
    expect(screen.getByText('2')).toBeInTheDocument(); // Cancelled prayers
  });

  test('renders prayer requests after loading', async () => {
    await act(async () => {
      render(<PrayerHub />);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
    });

    // Check for prayer request cards
    await waitFor(() => {
      expect(screen.getByText('Test Prayer Request')).toBeInTheDocument();
      expect(screen.getByText('Another Prayer Request')).toBeInTheDocument();
      expect(screen.getByText('Please pray for healing')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

//   test('renders categories in dropdown when dialog is opened', async () => {
//   await act(async () => {
//     render(<PrayerHub />);
//   });

//   // Wait for loader to disappear
//   await waitFor(() => {
//     expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
//   });

//   // Open the prayer request dialog
//   fireEvent.click(screen.getByText('+ PRAY REQUEST'));

//   await waitFor(() => {
//     expect(screen.getByText('Submit Prayer Request')).toBeInTheDocument();
//   });

//   // Open the category dropdown using data-testid
//   const categorySelect = screen.getByTestId('category-select');
//   fireEvent.mouseDown(categorySelect);

//   // Wait for dropdown options to appear
//   await waitFor(() => {
//     expect(screen.getByText('Super Admin Category2')).toBeInTheDocument();
//     expect(screen.getByText('Super Admin Category4')).toBeInTheDocument();
//     expect(screen.getByText('Health')).toBeInTheDocument();
//   });
// });


  // test('filters prayer requests by category', async () => {
  //   // Mock additional API call for filtered results
  //   const filteredResponse = {
  //     ...mockPrayerListResponse,
  //     data: [mockPrayerListResponse.data[0]] // Only first prayer request
  //   };

  //   fetch
  //     .mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => mockCategoriesResponse
  //     })
  //     .mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => mockPrayerListResponse
  //     })
  //     .mockResolvedValueOnce({
  //       ok: true,
  //       json: async () => filteredResponse
  //     });

  //   await act(async () => {
  //     render(<PrayerHub />);
  //   });

  //   // Wait for initial loading
  //   await waitFor(() => {
  //     expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
  //   });

  //   // Find and click category filter
  //   const categoryFilter = screen.getByDisplayValue('');
  //   const categorySelect = categoryFilter.closest('[role="button"]');
    
  //   await act(async () => {
  //     fireEvent.mouseDown(categorySelect);
  //   });

  //   // Wait for dropdown and select category
  //   await waitFor(() => {
  //     const healthOption = screen.getByText('Health');
  //     fireEvent.click(healthOption);
  //   });

  //   // Verify filtered results
  //   await waitFor(() => {
  //     expect(screen.getByText('Test Prayer Request')).toBeInTheDocument();
  //     expect(screen.queryByText('Another Prayer Request')).not.toBeInTheDocument();
  //   });
  // });

  test('opens and closes prayer request dialog', async () => {
    await act(async () => {
      render(<PrayerHub />);
    });

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
    });

    // Click pray request button
    const prayButton = screen.getByText('+ PRAY REQUEST');
    fireEvent.click(prayButton);

    // Check dialog opens
    await waitFor(() => {
      expect(screen.getByText('Submit Prayer Request')).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Check dialog closes
    await waitFor(() => {
      expect(screen.queryByText('Submit Prayer Request')).not.toBeInTheDocument();
    });
  });

test('submits prayer request form', async () => {
  const submitResponse = {
    status: 200,
    message: 'Prayer request submitted successfully'
  };

  // Mock API calls
  fetch
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockCategoriesResponse
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrayerListResponse
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => submitResponse
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => mockPrayerListResponse
    });

  await act(async () => {
    render(<PrayerHub />);
  });

  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
  });

  // Open prayer request dialog
  const prayButton = screen.getByText('+ PRAY REQUEST');
  fireEvent.click(prayButton);

  await waitFor(() => {
    expect(screen.getByText('Submit Prayer Request')).toBeInTheDocument();
  });

  // Open category dropdown
  const categorySelect = screen.getByRole('combobox', { name: /category/i });
  fireEvent.mouseDown(categorySelect);

  // Scope query to the dropdown listbox
  const listbox = within(screen.getByRole('listbox'));
  const healthOption = listbox.getByText('Health'); // Only inside the dropdown
  fireEvent.click(healthOption);

  // Fill title
  const titleInput = screen.getByRole('textbox', { name: /title/i });
  fireEvent.change(titleInput, { target: { value: 'Test Prayer Title' } });

  // Fill prayer request
  const requestInput = screen.getByTestId('prayer-request-input');
  fireEvent.change(requestInput, { target: { value: 'Please pray for me' } });

  // Submit form
  const submitButton = screen.getByText('Submit Request');
  await act(async () => {
    fireEvent.click(submitButton);
  });

  // Verify API call for submitting prayer
  expect(fetch).toHaveBeenCalledWith(
    expect.stringContaining('add-public-prayer'),
    expect.objectContaining({
      method: 'POST',
      headers: {
        'Authorization': 'Bearer mock-token',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        category: 3, // Health category ID
        title: 'Test Prayer Title',
        description: 'Please pray for me',
        priority: 'medium',
      })
    })
  );
});



  test('handles API error gracefully', async () => {
    // Mock API error
    fetch.mockRejectedValueOnce(new Error('Network error'));

    await act(async () => {
      render(<PrayerHub />);
    });

    // Should still render without crashing
    expect(screen.getByText('Public Prayer List')).toBeInTheDocument();
  });

  test('approves prayer request', async () => {
    const approveResponse = {
      status: 200,
      message: 'Prayer approved successfully'
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategoriesResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrayerListResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => approveResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockPrayerListResponse
      });

    await act(async () => {
      render(<PrayerHub />);
    });

    // Wait for loading
    await waitFor(() => {
      expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
    });

    // Find and click approve button for pending prayer
    const approveButtons = screen.getAllByLabelText('Approve');
    
    await act(async () => {
      fireEvent.click(approveButtons[0]);
    });

    // Verify approve API call
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('approve-prayer'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          id: 1,
          status: '1'
        })
      })
    );
  });

  test('shows no prayer requests message when list is empty', async () => {
    const emptyResponse = {
      ...mockPrayerListResponse,
      data: []
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategoriesResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => emptyResponse
      });

    await act(async () => {
      render(<PrayerHub />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
    });

    // Wait a bit more for the component to fully render the empty state
    await waitFor(() => {
      // Try to find the message, might be styled differently
      const noRequestsMessage = screen.getByText((content, element) => {
        return content.includes('No prayer requests found');
      });
      expect(noRequestsMessage).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  test('handles pagination', async () => {
    const paginatedResponse = {
      ...mockPrayerListResponse,
      pagination: {
        totalPages: 3
      }
    };

    fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockCategoriesResponse
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => paginatedResponse
      });

    await act(async () => {
      render(<PrayerHub />);
    });

    await waitFor(() => {
      expect(screen.queryByTestId('page-loader')).not.toBeInTheDocument();
    });

    // Check pagination component appears
    await waitFor(() => {
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
  });
});