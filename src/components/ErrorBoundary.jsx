import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 border border-red-200 rounded-2xl text-center my-4">
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                        ⚠️
                    </div>
                    <h2 className="text-xl font-bold text-red-900 mb-2">Something went wrong</h2>
                    <p className="text-red-700 mb-4">
                        An error occurred while loading this section. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
                    >
                        Refresh Page
                    </button>
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-4 bg-white border border-red-100 rounded-lg text-left overflow-auto max-h-40">
                            <p className="text-xs font-mono text-red-500">{this.state.error?.toString()}</p>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 
