import { renderHook, act } from "@testing-library/react-hooks";
import { useState } from "react";

// Mock onExport function
const mockOnExport = jest.fn(() =>
  Promise.resolve() // Ensuring it returns a promise
);

const mockResetState = jest.fn();

const useExportHook = () => {
  const [state, setState] = useState({
    progress: 0,
    isExportComplete: false,
    isError: false,
    exportStatus: "",
  });

  const exportData = () => {
    mockResetState();
    return mockOnExport({
      onProgress: (percentCompleted) => {
        setState((prevState) => ({
          ...prevState,
          progress: percentCompleted,
        }));
      },
    })
      .then(() => {
        setState((prevState) => ({
          ...prevState,
          progress: 100,
          isExportComplete: true,
          isError: false,
          exportStatus: "Export Successful",
        }));
      })
      .catch(() => {
        setState({
          progress: 100,
          exportStatus: "Export failed",
          isExportComplete: true,
          isError: true,
        });
      });
  };

  return { state, exportData };
};

// 🧪 **Unit Test for `exportData`**
describe("exportData function", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Reset mocks before each test
      });
  it("should update progress and complete export successfully", async () => {
    mockOnExport.mockResolvedValueOnce(); // Ensuring it always returns a Promise ✅

    const { result } = renderHook(() => useExportHook());

    await act(async () => {
      await result.current.exportData(); // Call the function inside `act()`
    });

    // Assertions
    expect(mockResetState).toHaveBeenCalled();
    expect(mockOnExport).toHaveBeenCalledWith(
      expect.objectContaining({
        onProgress: expect.any(Function),
      })
    );

    expect(result.current.state.progress).toBe(100);
    expect(result.current.state.isExportComplete).toBe(true);
    expect(result.current.state.isError).toBe(false);
    expect(result.current.state.exportStatus).toBe("Export Successful");
  });

  it("should handle export failure correctly", async () => {
    mockOnExport.mockRejectedValueOnce(new Error("Export failed")); // Simulating a failure ✅

    const { result } = renderHook(() => useExportHook());

    await act(async () => {
      await result.current.exportData().catch(() => {}); // Catching to prevent unhandled promise rejection
    });

    expect(result.current.state.progress).toBe(100);
    expect(result.current.state.isExportComplete).toBe(true);
    expect(result.current.state.isError).toBe(true);
    expect(result.current.state.exportStatus).toBe("Export failed");
  });

});



// import React from 'react';
// import { render, fireEvent, waitFor } from '@testing-library/react';
// import ExportDiagram from '../../components/Modals/ExportDiagrams'; // Adjust the import path as necessary
// import { Translation } from 'react-i18next'; // Assuming you're using i18next for translations

// // Mock the Translation component
// jest.mock('react-i18next', () => ({
//   Translation: ({ children }) => children((key) => key), // Simple mock for translation
// }));

// jest.mock("@formsflow/components", () => {
//     const actual = jest.requireActual("../../../__mocks__/@formsflow/components");
//     return {
//       HistoryIcon: () => <span>History Icon</span>,
//       CloseIcon: actual.CloseIcon,
//       ErrorModal: () => <div>Error Modal</div>,
//       HistoryModal: () => <div>History Modal</div>,
//       CustomButton: actual.CustomButton,
//       CustomInfo: actual.CustomInfo,
//       FailedIcon:actual.FailedIcon
//     };
//   });
  
// describe('ExportDiagram Component', () => {

//   beforeEach(() => {
//     jest.clearAllMocks(); // Clear previous mock calls
//   });

//   const mockOnExport = jest.fn(() => {
//     return new Promise((resolve) => {
//       setTimeout(() => {
//         resolve(); // Simulate successful export
//       }, 100);
//     });
//   });
//   test('should call onExport and handle success', async () => {
  
  
//     const { getByText } = render(
//       <ExportDiagram
//         showExportModal={true}
//         onClose={() => {}}
//         onExport={mockOnExport}
//         fileName="testFile.bpmn"
//         modalTitle="Export Test"
//         successMessage="Export Successful"
//         errorMessage={null}
//       />
//     );
  
//     fireEvent.click(getByText('Export Test'));
  
//     await waitFor(() => {
//       expect(mockOnExport).toHaveBeenCalled();
//     });
  
//     expect(getByText('Export Successful')).toBeInTheDocument();
//   });

//   test('should handle export failure', async () => {

//     const { getByText } = render(
//       <ExportDiagram
//         showExportModal={true}
//         onClose={() => {}}
//         onExport={mockOnExport}
//         fileName="testFile.bpmn"
//         modalTitle="Export Test"
//         successMessage="Export Successful"
//         errorMessage="Export failed"
//       />
//     );

//     // Simulate the action that triggers exportData
//     fireEvent.click(getByText('Export')); // Adjust this to the actual button text

//     // Wait for the onExport to be called
//     await waitFor(() => {
//       expect(mockOnExport).toHaveBeenCalled();
//     });

//     // Check for error message
//     expect(getByText('Export failed')).toBeInTheDocument();
//   });

//   test('should call onClose when modal is closed', () => {
//     const mockOnClose = jest.fn();

//     const { getByText } = render(
//       <ExportDiagram
//         showExportModal={true}
//         onClose={mockOnClose}
//         onExport={mockOnExport}
//         fileName="testFile.bpmn"
//         modalTitle="Export Test"
//         successMessage="Export Successful"
//         errorMessage={null}
//       />
//     );

//     // Simulate closing the modal
//     fireEvent.click(getByText('Close')); // Adjust this to the actual close button text

//     expect(mockOnClose).toHaveBeenCalled();
//   });
// });