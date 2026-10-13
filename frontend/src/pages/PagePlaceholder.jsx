export default function PagePlaceholder({ title }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500">This page will be built in an upcoming task.</p>
    </div>
  );
}