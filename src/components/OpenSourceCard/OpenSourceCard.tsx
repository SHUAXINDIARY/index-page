import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowUpRight,
  Code2,
  ExternalLink,
  FolderGit2,
  Github,
  X,
} from 'lucide-react';
import { Card } from '../Card';
import './OpenSourceCard.css';
import type {
  OpenSourceInfo,
  OpenSourceProject,
  OpenSourceProjectStatus,
} from '../../config/content';

/** 卡片预览中展示的项目数量 */
const CARD_PREVIEW_LIMIT = 2;

/** 开源项目弹窗标题 ID */
const MODAL_TITLE_ID = 'open-source-modal-title';

/** 开源项目状态标签映射 */
const statusLabelMap: Record<OpenSourceProjectStatus, string> = {
  active: '活跃开发',
  maintained: '持续维护',
  archived: '归档',
};

/** OpenSourceCard 组件属性 */
interface OpenSourceCardProps {
  /** 开源项目卡片配置 */
  config: OpenSourceInfo;
}

/** OpenSourceModal 组件属性 */
interface OpenSourceModalProps {
  /** 开源项目完整配置 */
  config: OpenSourceInfo;
  /** 关闭弹窗回调 */
  onClose: () => void;
}

/** OpenSourceProjectRow 组件属性 */
interface OpenSourceProjectRowProps {
  /** 单个开源项目配置 */
  project: OpenSourceProject;
}

/** 从 URL 中提取适合展示的主机名 */
const getReadableHost = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'GitHub';
  }
};

/** 单个项目详情行 */
const OpenSourceProjectRow = ({ project }: OpenSourceProjectRowProps) => {
  /** 仓库主机名，用于链接辅助说明 */
  const repoHost = useMemo(() => getReadableHost(project.repoUrl), [project.repoUrl]);

  return (
    <article className="open-source-project-row">
      <div className="open-source-project-main">
        <div className="open-source-project-heading">
          <h3>{project.name}</h3>
          <span className={`open-source-status open-source-status--${project.status}`}>
            {statusLabelMap[project.status]}
          </span>
        </div>

        <p className="open-source-project-description">{project.description}</p>

        <div className="open-source-project-tags" aria-label={`${project.name} 项目标签`}>
          {project.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </div>

      <div className="open-source-project-meta">
        <span className="open-source-project-language">
          <Code2 size={14} strokeWidth={1.8} aria-hidden="true" />
          {project.language}
        </span>
        <span>{project.role}</span>
      </div>

      <div className="open-source-project-actions">
        <a href={project.repoUrl} target="_blank" rel="noopener noreferrer">
          <Github size={15} strokeWidth={1.9} aria-hidden="true" />
          {repoHost}
        </a>
        {project.homepageUrl ? (
          <a href={project.homepageUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink size={15} strokeWidth={1.9} aria-hidden="true" />
            线上预览
          </a>
        ) : null}
      </div>
    </article>
  );
};

/** 开源项目详情弹窗 */
const OpenSourceModal = ({ config, onClose }: OpenSourceModalProps) => {
  useEffect(() => {
    /** 进入弹窗前的 body 滚动状态 */
    const previousOverflow = document.body.style.overflow;

    /** ESC 键关闭弹窗 */
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      className="open-source-modal-overlay"
      role="presentation"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: [0.25, 1, 0.5, 1] }}
    >
      <motion.section
        className="open-source-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={MODAL_TITLE_ID}
        onClick={(event) => event.stopPropagation()}
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="open-source-modal-header">
          <div>
            <span className="open-source-modal-kicker">{config.tag}</span>
            <h2 id={MODAL_TITLE_ID}>{config.title}</h2>
            <p>{config.description}</p>
          </div>
          <button
            className="open-source-modal-close"
            type="button"
            onClick={onClose}
            aria-label="关闭开源项目弹窗"
          >
            <X size={20} strokeWidth={1.9} aria-hidden="true" />
          </button>
        </header>

        <div className="open-source-modal-summary" aria-label="开源项目概览">
          <span>{config.projects.length} 个项目</span>
          <span>React / Rsbuild / Canvas</span>
          <span>个人工具与内容索引</span>
        </div>

        <div className="open-source-project-list">
          {config.projects.map((project) => (
            <OpenSourceProjectRow key={project.name} project={project} />
          ))}
        </div>
      </motion.section>
    </motion.div>,
    document.body,
  );
};

export const OpenSourceCard = ({ config }: OpenSourceCardProps) => {
  /** 是否展示开源项目详情弹窗 */
  const [isModalOpen, setIsModalOpen] = useState(false);

  /** 卡片预览优先展示 featured 项目 */
  const previewProjects = useMemo(() => {
    const featuredProjects = config.projects.filter((project) => project.featured);
    const sourceProjects = featuredProjects.length > 0 ? featuredProjects : config.projects;
    return sourceProjects.slice(0, CARD_PREVIEW_LIMIT);
  }, [config.projects]);

  /** 打开项目详情弹窗 */
  const handleOpenModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  /** 关闭项目详情弹窗 */
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <>
      <Card className="open-source-card">
        <button
          className="open-source-card-trigger"
          type="button"
          onClick={handleOpenModal}
          aria-haspopup="dialog"
          aria-label="查看全部开源项目"
        >
          <span className="open-source-card-kicker">{config.tag}</span>

          <span className="open-source-card-title-row">
            <span className="open-source-card-icon" aria-hidden="true">
              <FolderGit2 size={22} strokeWidth={1.85} />
            </span>
            <span className="open-source-card-title">{config.title}</span>
          </span>

          <span className="open-source-card-description">{config.description}</span>

          <span className="open-source-card-preview" aria-label="重点开源项目">
            {previewProjects.map((project) => (
              <span key={project.name} className="open-source-card-project">
                <span>{project.name}</span>
                <small>{project.language}</small>
              </span>
            ))}
          </span>

          <span className="open-source-card-footer">
            <span>{config.projects.length} 个项目</span>
            <span className="open-source-card-action">
              {config.ctaLabel}
              <ArrowUpRight size={14} strokeWidth={2} aria-hidden="true" />
            </span>
          </span>
        </button>
      </Card>

      <AnimatePresence>
        {isModalOpen ? (
          <OpenSourceModal key="open-source-modal" config={config} onClose={handleCloseModal} />
        ) : null}
      </AnimatePresence>
    </>
  );
};
