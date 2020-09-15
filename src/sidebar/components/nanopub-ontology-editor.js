import { createElement } from 'preact';
import { useState } from 'preact/hooks';
import { withServices } from '../util/service-context';
import propTypes from 'prop-types';

/**
 * @typedef NanoPubOntologyEditorProps
 * @prop {(a: Object<'tags', string[]>) => any} onEditOntology - Callback that saves the tag list.
 * @prop {string[]} ontologiesList - The ontology value
 * @prop {Object} nanopubs - Services
 */

/**
 * Component to edit ontologies
 *
 * @param {NanoPubOntologyEditorProps} props
 */
function NanoPubOntologyEditor({ onEditOntology, ontologiesList, nanopubs: nanopubsService }) {
  const [ontologies] = useState(nanopubsService.config().ontologies)

  /**
   *  Update the suggestions if the user changes the value of the input
   *
   * @param {import("preact").JSX.TargetedEvent<HTMLSelectElement, InputEvent>} e
   */
  const handleOnSelect = e => {
    if (
      e &&
      e.target
    ) {
      const ontology = e.target['value'];
      onEditOntology({ ontology: ontology });
    }
  }

  return (
    <section className="nanopub-ontology-editor">
      <select
        value={ontologiesList}
        onChange={handleOnSelect}
        className="nanopub-ontology-editor__input"
      >
        <option
          value={undefined}
        >
          Select Ontology
          </option>
        {
          ontologies.map(tag => {
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
    </section>
  );
}

NanoPubOntologyEditor.propTypes = {
  onEditOntology: propTypes.func.isRequired,
  ontology: propTypes.object,
  nanopubs: propTypes.object.isRequired,
};
NanoPubOntologyEditor.injectedProps = ['nanopubs'];

export default withServices(NanoPubOntologyEditor);
