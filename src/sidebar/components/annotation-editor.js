import { createElement } from 'preact';
import { useState } from 'preact/hooks';
import propTypes from 'prop-types';

import { normalizeKeyName } from '../../shared/browser-compatibility-utils';
import { withServices } from '../util/service-context';
import { applyTheme } from '../util/theme';
import useStore from '../store/use-store';

import AnnotationLicense from './annotation-license';
import AnnotationPublishControl from './annotation-publish-control';
import MarkdownEditor from './markdown-editor';
import TagEditor from './tag-editor';
import NanoPubOntologyEditor from "./nanopub-ontology-editor";
import NanoPubTagEditor from "./nanopub-tag-editor";

/**
 * @typedef {import("../../types/api").Annotation} Annotation
 * @typedef {import("../../types/config").MergedConfig} MergedConfig
 */

/**
 * @typedef AnnotationEditorProps
 * @prop {Annotation} annotation - The annotation under edit
 * @prop {Object} annotationsService - Injected service
 * @prop {MergedConfig} settings - Injected service
 * @prop {Object} toastMessenger - Injected service
 * @prop {Object} tags - Injected service
 * @prop {Object} nanopubs - nanopubs Service
 */

/**
 * Display annotation content in an editable format.
 *
 * @param {AnnotationEditorProps} props
 */
function AnnotationEditor({
  annotation,
  annotationsService,
  settings,
  tags: tagsService,
  toastMessenger,
  nanopubs
}) {
  // Track the currently-entered text in the tag editor's input
  const [pendingTag, setPendingTag] = useState(
    /** @type {string|null} */(null)
  );

  const draft = useStore(store => store.getDraft(annotation));
  const createDraft = useStore(store => store.createDraft);
  const group = useStore(store => store.getGroup(annotation.group));

  if (!draft) {
    // If there's no draft, we can't be in editing mode
    return null;
  }

  const shouldShowLicense =
    !draft.isPrivate && group && group.type !== 'private';

  const tags = draft.tags.filter(tag => !nanopubs.tools.ontologies.isOntologyTag(tag));
  const text = draft.text;
  const [ontologies, setOntologies] = useState(draft.tags.filter(nanopubs.tools.ontologies.isOntologyTag).map(tag => nanopubs.tools.ontologies.decodeOntologyTag(tag, false)));
  const isEmpty = !text && !tags.length;

  const onEditTags = ({ tags }) => {
    createDraft(draft.annotation, { ...draft, tags });
  };

  /**
   * Verify `newTag` has content and is not a duplicate; add the tag
   *
   * @param {string} newTag
   * @return {boolean} - `true` if tag is added
   */
  const onAddTag = newTag => {
    if (!newTag || tags.indexOf(newTag) >= 0) {
      // don't add empty or duplicate tags
      return false;
    }
    const tagList = [...tags, newTag];
    // Update the tag locally for the suggested-tag list
    tagsService.store(tagList.map(tag => ({ text: tag })));
    onEditTags({ tags: tagList });
    return true;
  };

  /**
   * Remove a tag from the annotation.
   *
   * @param {string} tag
   * @return {boolean} - `true` if tag extant and removed
   */
  const onRemoveTag = tag => {
    const newTagList = [...tags]; // make a copy
    const index = newTagList.indexOf(tag);
    if (index >= 0) {
      newTagList.splice(index, 1);
      onEditTags({ tags: newTagList });
      return true;
    }
    return false;
  };

  const onEditText = ({ text }) => {
    createDraft(draft.annotation, { ...draft, text });
  };

  const onEditOntology = ({ ontology }) => {
    if (!ontology || ontologies.indexOf(ontology) >= 0) {
      // don't add empty or duplicate tags
      return false;
    }
    setOntologies([ontology]);
  };

  const onSave = async () => {
    // If there is any content in the tag editor input field that has
    // not been committed as a tag, go ahead and add it as a tag
    // See https://github.com/hypothesis/product-backlog/issues/1122
    if (pendingTag) {
      onAddTag(pendingTag);
    }
    // merge ontologies in tags of anotations
    const ontologiesWithFormat = ontologies.map(ontology => `_${ontology}_`);
    onEditTags({ tags: [...tags, ...ontologiesWithFormat] });
    try {
      await annotationsService.save(annotation);
    } catch (err) {
      toastMessenger.error('Saving annotation failed');
    }
  };

  // Allow saving of annotation by pressing CMD/CTRL-Enter
  const onKeyDown = event => {
    const key = normalizeKeyName(event.key);
    if (isEmpty) {
      return;
    }
    if ((event.metaKey || event.ctrlKey) && key === 'Enter') {
      event.stopPropagation();
      event.preventDefault();
      onSave();
    }
  };

  const textStyle = applyTheme(['annotationFontFamily'], settings);

  return (
    /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
    <div className="annotation-editor u-vertical-rhythm" onKeyDown={onKeyDown}>
      <MarkdownEditor
        textStyle={textStyle}
        label="Annotation body"
        text={text}
        onEditText={onEditText}
      />
      <NanoPubOntologyEditor
        onEditOntology={onEditOntology}
        ontologiesList={ontologies}
      />
      <NanoPubTagEditor
        onEditTags={onEditTags}
        tagList={tags}
      />
      { false &&
        <TagEditor
          onAddTag={onAddTag}
          onRemoveTag={onRemoveTag}
          onTagInput={setPendingTag}
          tagList={tags}
        />
      }
      <div className="annotation__form-actions u-layout-row">
        <AnnotationPublishControl
          annotation={annotation}
          isDisabled={isEmpty}
          onSave={onSave}
        />
      </div>
      {shouldShowLicense && <AnnotationLicense />}
    </div>
  );
}

AnnotationEditor.propTypes = {
  annotation: propTypes.object.isRequired,
  annotationsService: propTypes.object,
  settings: propTypes.object,
  tags: propTypes.object.isRequired,
  toastMessenger: propTypes.object,
  nanopubs: propTypes.object
};

AnnotationEditor.injectedProps = [
  'annotationsService',
  'settings',
  'tags',
  'toastMessenger',
  'nanopubs'
];

export default withServices(AnnotationEditor);
