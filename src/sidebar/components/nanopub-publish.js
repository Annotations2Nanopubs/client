import { createElement } from 'preact';
import { withServices } from '../util/service-context';
import propTypes from 'prop-types';
import useRootThread from './hooks/use-root-thread';

/**
 * Component to publish all anotation of rootThread to nanopubs
 */
function NanoPubPublish({ nanopubs: nanopubsService }) {
  const rootThread = useRootThread();

  /**
   *  Update the suggestions if the user changes the value of the input
   *
   * @param {import("preact").JSX.TargetedEvent<HTMLButtonElement>} e
   */
  const handleOnClick = e => {
      nanopubsService.publish(rootThread.children.map(thread => thread.annotation));
  }

  return (
    <div className="nanopub-publish">
        <button className="nanopub-publish__button"
            onClick={handleOnClick}
            >
              Publish nanopublication
        </button>
    </div>
  );
}

NanoPubPublish.propTypes = {
  nanopubs: propTypes.object.isRequired
};

NanoPubPublish.injectedProps = ['nanopubs'];

export default withServices(NanoPubPublish);
