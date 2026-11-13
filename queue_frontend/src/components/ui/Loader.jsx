function Loader({ label = 'Loading...' }) {
  return (
    <div className="ui-loader" role="status">
      <span className="ui-spinner" />
      <p>{label}</p>
    </div>
  );
}

export default Loader;
