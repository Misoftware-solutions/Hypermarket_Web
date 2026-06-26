import React from 'react';
import { Result, Button } from 'antd';

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
        <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
          <Result
            status="error"
            title="Something went wrong"
            subTitle="Sorry, an unexpected error occurred while loading this page."
            extra={[
              <Button type="primary" key="home" onClick={() => window.location.href = '/'}>
                Go Home
              </Button>,
              <Button key="retry" onClick={() => this.setState({ hasError: false })}>
                Try Again
              </Button>
            ]}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
