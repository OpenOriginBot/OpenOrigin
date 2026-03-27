import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { PageHeader } from '../PageHeader';
import { EmptyState, Loading } from '../common';

import styles from './MemoryViewer.module.css';

interface MemoryFile {
  name: string;
  date: string;
  size: number;
  pinned: boolean;
}

export function MemoryViewer() {
  const [files, setFiles] = useState<MemoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [contentLoading, setContentLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      loadFileContent(selectedFile);
    }
  }, [selectedFile]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/memory/files');
      if (!res.ok) throw new Error('Failed to load files');
      const data = await res.json();
      setFiles(data.files || []);

      // Auto-select first file if available
      if (data.files?.length > 0 && !selectedFile) {
        setSelectedFile(data.files[0].name);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFileContent = async (filename: string) => {
    try {
      setContentLoading(true);
      const res = await fetch(`/api/memory/file?path=${encodeURIComponent(filename)}`);
      if (!res.ok) throw new Error('Failed to load file');
      const content = await res.text();
      setFileContent(content);
    } catch (e: any) {
      setFileContent(`## 错误\n\n无法加载文件：${e.message}`);
    } finally {
      setContentLoading(false);
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading) {
    return <Loading text="加载记忆文件中..." />;
  }

  if (error) {
    return (
      <EmptyState
        icon="❌"
        title="加载失败"
        description={error}
      />
    );
  }

  return (
    <div className={styles.page}>
      <PageHeader
        icon="🧠"
        title="内存查看器"
        description="查看每日记录、长期记忆和工作日志"
      />

      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link to="/brain">大脑</Link>
        <span> / </span>
        <span>内存查看器</span>
      </div>

      <div className={styles.container}>
        {/* File List */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <span className={styles.sidebarTitle}>文件列表</span>
            <span className={styles.fileCount}>{files.length} 个文件</span>
          </div>

          {files.length === 0 ? (
            <div className={styles.emptySidebar}>
              <span>暂无记忆文件</span>
            </div>
          ) : (
            <ul className={styles.fileList}>
              {files.map(file => (
                <li key={file.name}>
                  <button
                    className={`${styles.fileItem} ${selectedFile === file.name ? styles.active : ''}`}
                    onClick={() => setSelectedFile(file.name)}
                  >
                    <div className={styles.fileItemContent}>
                      {file.pinned && <span className={styles.pinnedIcon}>📌</span>}
                      <span className={styles.fileName}>{file.name}</span>
                    </div>
                    <div className={styles.fileMeta}>
                      <span className={styles.fileDate}>{file.date}</span>
                      <span className={styles.fileSize}>{formatSize(file.size)}</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* Content Preview */}
        <main className={styles.preview}>
          {selectedFile ? (
            <>
              <div className={styles.previewHeader}>
                <span className={styles.previewTitle}>{selectedFile}</span>
              </div>
              <div className={styles.previewContent}>
                {contentLoading ? (
                  <Loading text="加载内容中..." />
                ) : (
                  <ReactMarkdown>{fileContent}</ReactMarkdown>
                )}
              </div>
            </>
          ) : (
            <div className={styles.previewPlaceholder}>
              <EmptyState
                icon="📄"
                title="选择文件"
                description="从左侧列表选择一个文件以预览内容"
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}