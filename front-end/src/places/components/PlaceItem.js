import React, { useState, useContext } from 'react';

import './PlaceItem.css';
import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';

const PlaceItem = (props) => {
    const auth = useContext(AuthContext);
    const [showMap, setShowMap] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const { isLoading, error, sendRequest, clearError } = useHttpClient();

    const openMapHandler = () => setShowMap(true);
    const closeMapHandler = () => setShowMap(false);
    const showDeleteWarningHandler = () => setShowConfirmModal(true);
    const cancelDeleteHandler = () => setShowConfirmModal(false);
    const confirmDeleteHandler = async () => {
        setShowConfirmModal(false);

        try {
            await sendRequest(
                `${process.env.REACT_APP_BACKEND_URL}/places/${props.id}`,
                'DELETE',
                null,
                {
                    Authorization: 'Bearer ' + auth.token,
                }
            );
            props.onDelete(props.id);
        } catch (err) {}
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={clearError}></ErrorModal>
            <Modal
                show={showMap}
                onCancel={closeMapHandler}
                header={props.address}
                contentClass='place-item__modal-content'
                footerClass='place-item__modal-actions'
                footer={<Button onClick={closeMapHandler}>Close</Button>}
            >
                <div className='map-container'>
                    <Map center={props.location} zoom={16}></Map>
                </div>
            </Modal>
            <Modal
                show={showConfirmModal}
                onCancel={cancelDeleteHandler}
                header='Are you sure?'
                footerClass='place-item__modal-actions'
                footer={
                    <React.Fragment>
                        <Button inverse onClick={cancelDeleteHandler}>
                            Cancel
                        </Button>
                        <Button onClick={confirmDeleteHandler}>Delete</Button>
                    </React.Fragment>
                }
            >
                <p>
                    Do you want to proceed to delete this place? Please note that in can't be undone
                    later
                </p>
            </Modal>
            <li className='place-item'>
                {isLoading && <LoadingSpinner asOverlay></LoadingSpinner>}
                <Card className='place-item__content'>
                    <div className='place-item__image'>
                        <img src={`${process.env.REACT_APP_ASSET_URL}/${props.image}`} alt='' />
                    </div>
                    <div className='place-item__info'>
                        <h2>{props.title}</h2>
                        <h3>{props.address}</h3>
                        <p>{props.description}</p>
                    </div>
                    <div className='place-item__actions'>
                        <Button inverse onClick={openMapHandler}>
                            VIEW ON MAP
                        </Button>
                        {auth.userId === props.creator && (
                            <React.Fragment>
                                <Button to={`/places/${props.id}`}>EDIT</Button>
                                <Button danger onClick={showDeleteWarningHandler}>
                                    DELETE
                                </Button>
                            </React.Fragment>
                        )}
                    </div>
                </Card>
            </li>
        </React.Fragment>
    );
};

export default PlaceItem;
