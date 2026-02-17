import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DocumentEditor, DocumentVersions } from '@/components/documents';

export function DocumentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [showVersions, setShowVersions] = useState(false);

  if (!id) {
    return null;
  }

  return (
    <div className="h-full flex">
      {/* Main Editor */}
      <div className={`flex-1 ${showVersions ? 'hidden md:block' : ''}`}>
        <DocumentEditor onShowVersions={() => setShowVersions(true)} />
      </div>

      {/* Versions Panel */}
      {showVersions && (
        <div className="w-full md:w-96 flex-shrink-0">
          <DocumentVersions
            documentId={id}
            onClose={() => setShowVersions(false)}
          />
        </div>
      )}
    </div>
  );
}

export default DocumentDetailPage;
