import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  loadDocumentVersionsRequest,
  addDocumentVersionRequest,
  loadDocumentVersionRequest,
} from "../../store/version/versionActions";
import {
  selectVersionsList,
  selectVersionLoading,
  selectSingleVersion,
} from "../../store/version/versionSelectors";
import styles from "./DocumentVersionList.module.scss";
import { timeSince } from "../../utils/TimeSince";

interface VersionListProps {
  content: string | null;
  setContent: (content: string) => void;
  setSelectedVersionSubtitle: (subtitle: string) => void;
  setSelectedVersionDate: (date: string) => void;
}

const DocumentVersionList: React.FC<VersionListProps> = ({
  content,
  setContent,
  setSelectedVersionSubtitle,
  setSelectedVersionDate,
}) => {
  const { documentId } = useParams();
  const dispatch = useDispatch();
  const versions = useSelector(selectVersionsList);
  const loading = useSelector(selectVersionLoading);
  const versionInfo = useSelector(selectSingleVersion);

  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [contentChanged, setContentChanged] = useState(false);
  const [isVersionComparatorExpanded, setIsVersionComparatorExpanded] = useState(false);

  const handleCtrlS = (event: KeyboardEvent) => {
    if ((event.ctrlKey && event.key === "s") || (event.metaKey && event.key === "s")) {
      event.preventDefault();
      if (!contentChanged) {
        alert("수정된 내용이 없습니다.");
        return;
      }
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleCtrlS);
    return () => {
      window.removeEventListener("keydown", handleCtrlS);
    };
  }, [contentChanged]);

  const handleAddVersion = () => {
    if (contentChanged) {
      setIsModalOpen(true);
    } else {
      alert("변경된 내용이 없습니다");
      return;
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSubtitle("");
  };

  const handleModalSubmit = () => {
    if (!subtitle) {
      alert("버전 이름을 입력해주세요.");
      return;
    }

    if (documentId) {
      const newVersionInfo = {
        subtitle: subtitle,
        documentId: Number(documentId),
        content: content || "",
      };
      dispatch(addDocumentVersionRequest(newVersionInfo));
      setIsModalOpen(false);
      setSubtitle("");
    }
  };

  const fetchVersionInfo = (versionId: number) => {
    dispatch(loadDocumentVersionRequest(versionId));
  };

  const handleVersionItemClick = (version: any) => {
    if (contentChanged) {
      const isConfirmed = window.confirm(
        "변경된 사항은 저장되지 않습니다. 정말로 이동하시겠습니까?"
      );
      if (!isConfirmed) return;
    }

    setSelectedVersionSubtitle(version.subtitle);
    setSelectedVersionDate(version.createdAt);
    setSelectedVersionId(version.id);
    fetchVersionInfo(version.id);
    setIsVersionComparatorExpanded(true);
  };

  useEffect(() => {
    if (documentId) {
      dispatch(loadDocumentVersionsRequest(documentId));
    }
  }, [documentId, dispatch]);

  useEffect(() => {
    if (versions && versions.length > 0) {
      const firstVersion = versions[0];
      setSelectedVersionSubtitle(firstVersion.subtitle);
      setSelectedVersionDate(firstVersion.createdAt);
      setSelectedVersionId(firstVersion.id);
      fetchVersionInfo(firstVersion.id);
    } else {
      setContent(""); // 버전 정보가 없는 경우 content 초기화
      setSelectedVersionSubtitle("");
      setSelectedVersionDate("");
    }
  }, [versions]);

  useEffect(() => {
    if (versionInfo?.content) {
      setContent(versionInfo.content);
      setSelectedVersionSubtitle(versionInfo.subtitle);
      setSelectedVersionDate(versionInfo.createdAt);
    } else {
      setContent(""); // 버전 정보가 없는 경우 content 초기화
      setSelectedVersionSubtitle("");
      setSelectedVersionDate("");
    }
  }, [versionInfo, versions, documentId]);

  useEffect(() => {
    if (versionInfo?.content !== content) {
      setContentChanged(true);
    } else {
      setContentChanged(false);
    }
  }, [content, contentChanged]);

  const handleModalOuterClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.target === event.currentTarget) {
      handleModalClose();
    }
  };

  return (
    <>
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <h3>문서 버전</h3>
        <button onClick={handleAddVersion} className={styles.addButton}>
          +
        </button>
      </div>
      <div className={styles.versionList}>
        {versions?.map((version) => (
          <div
            key={version.id}
            className={`${styles.versionItem} ${
              selectedVersionId === version.id ? styles.selectedVersion : ""
            }`}
            onClick={() => handleVersionItemClick(version)}
          >
            <span> {version.subtitle}</span>
            <span> {timeSince(version.createdAt)}</span>
          </div>
        ))}
      </div>
      {isModalOpen && (
        <div className={styles.modalContainer} onClick={handleModalOuterClick}>
          <div className={styles.modalContent}>
            <div>버전 이름</div>
            <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
            <button onClick={handleModalSubmit}>확인</button>
            <button onClick={handleModalClose}>취소</button>
          </div>
        </div>
      )}
    </>
  );
};

export default DocumentVersionList;
