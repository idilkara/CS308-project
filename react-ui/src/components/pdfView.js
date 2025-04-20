function PdfViewer({ pdfUrl }) {
    if (pdfUrl==null) return <p>Loading PDF...</p>;
  
    return (
      <iframe
        src={pdfUrl}
        width="100%"
        height="600px"
        title="Invoice PDF"
      />
    );
  }

export default PdfViewer;