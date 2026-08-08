function UnauthorizedPage() {
  return (
    <div style={{ padding: "80px", textAlign: "center" }}>
      <h1>Access Denied</h1>
      <p>You do not have permission to access this page.</p>
      <button onClick={() => (window.location.href = "/dashboard")}>
        Go Back
      </button>
    </div>
  );
}

export default UnauthorizedPage;