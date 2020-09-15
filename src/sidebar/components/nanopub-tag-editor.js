import { createElement } from 'preact';
import { useState } from 'preact/hooks';
import propTypes from 'prop-types';

import { withServices } from '../util/service-context';

/**
 * @typedef TagEditorProps
 * @prop {(a: Object<'tags', string[]>) => any} onEditTags - Callback that saves the tag list.
 * @prop {string[]} tagList - The list of editable tags as strings.
 * @prop {Object} nanopubs - Services
 */

/**
 * Component to edit annotation's tags.
 *
 * Component accessibility is modeled after "Combobox with Listbox Popup Examples" found here:
 * https://www.w3.org/TR/wai-aria-practices/examples/combobox/aria1.1pattern/listbox-combo.html
 *
 * @param {TagEditorProps} props
 */
function NanoPubTagEditor({ onEditTags, nanopubs: nanopubService, tagList }) {
  const [tags,setTags] = useState(nanopubService.config().tags);
  /**
   * Adds a tag to the annotation equal to the value of the input field
   * and then clears out the suggestions list and the input field.
   *
   * @param {string} newTag
   */
  const addTag = newTag => {
    const value = newTag.trim();
    if (value.length === 0) {
      // don't add an empty tag
      return;
    }
    if (tagList.indexOf(value) >= 0) {
      // don't add duplicate tag
      return;
    }
    onEditTags({ tags: [...tagList, value]})
  };

  /**
   *  Update the suggestions if the user changes the value of the input
   *
   * @param {import("preact").JSX.TargetedEvent<HTMLSelectElement, InputEvent>} e
   */
  const handleOnSelect = e => {
    if(
      e &&
      e.target
    ){
      const tag = e.target['value'];
      if(
          tag
        ){
        tagList = [];
        addTag(tag);
      }
    }
  }

  return (
    <section className="nanopub-tag-editor">
      <span
        className="tag-editor__combobox-wrapper"
      >
        <select
          onChange={handleOnSelect}
          className="tag-editor__input"
          value={tagList}
        >
          <option 
            value={undefined}
          >
            Select Tag
          </option>
          {
            tags.map(tag => {
              return (
                <option 
                  value={tag}
                >
                  {tag}
                </option>
              )
            })
          }
        </select>
      </span>
    </section>
  );
}

NanoPubTagEditor.propTypes = {
  onEditTags: propTypes.func.isRequired,
  tagList: propTypes.array.isRequired,
  nanopubs: propTypes.object.isRequired,
};

NanoPubTagEditor.injectedProps = ['nanopubs'];

export default withServices(NanoPubTagEditor);
