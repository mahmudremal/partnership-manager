import React, { use, useEffect, useRef, useState } from "react";
import { home_url, rest_url, notify, strtotime } from "@functions";
import request from "@common/request";
import { Link } from '@common/link';
import { usePopup } from '@context/PopupProvider';
import { useTranslation } from '@context/LanguageProvider';
import { useParams } from "react-router-dom";
import { AlignLeft, CalendarDays, CirclePlus, Copy, EllipsisVertical, ListTodo, Paperclip, SquareCheckBig, SquarePen, Tag, Trash2, User, UserMinus, UserPlus } from "lucide-react";
import { createPopper } from '@popperjs/core';


export default function Contract_Board() {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { contract_id } = useParams();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState({columns: []});

    const onUpdateColumn = (data) => {
        setProject(prev => ({...prev, columns: prev.columns.map(col => col.id === data.id ? data : col)}));
        return Promise.resolve(true);
    };
    const onDeleteColumn = (data) => {
        setProject(prev => ({...prev, columns: prev.columns.filter(col => col.id !== data.id)}));
        return Promise.resolve(true);
    };
    const onAddColumn = (data) => {
        setProject(prev => ({...prev, columns: [...prev.columns, data]}));
        return Promise.resolve(true);
    };
    
    
    const fetchContract = () => {
        // Simulate an API call to fetch contracts
        request(rest_url(`/partnership/v1/contracts/${contract_id}`))
        .then(data => {
            const { contract, columns } = data;
            if (!contract) {return notify.error(__('No contract found!'))}
            setProject({...contract, columns: columns});
            // request(rest_url(`/partnership/v1/contracts/${contract_id}/columns`))
            // .then(columns => {
            //     const { columns: contract_columns } = columns;
            //     if (!contract_columns) {return notify.error(__('No contract columns found!'))}
            //     setProject(prev => ({...prev, columns: contract_columns}));
            //     request(rest_url(`/partnership/v1/contracts/${contract_id}/cards`))
            //     .then(cards => {
            //         const { cards: contract_cards } = cards;
            //         if (!contract_cards) {return notify.error(__('No contract cards found!'))}
            //         setProject(prev => ({...prev, cards: contract_cards}));
            //     });
            // });
        })
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
        .finally(() => setLoading(false));
    }

    const whether_empty = (text, empty) => {
        return text === '' || !text ? empty : text;
    }

    useEffect(() => {
        fetchContract();
    }, []);
    
    return (
        <div className="xpo_w-full">
            <div className="xpo_p-4">
                {/* here you'll implement trello like Kanban board. */}
                <div className="overflow-x-auto scroll-sm pb-8">
                    <div className="kanban-wrapper">
                        <div className="d-flex align-items-start gap-24" id="sortable-wrapper">
                            {project?.columns?.map((column, columnIndex) => (
                                <SingleColumn
                                    key={columnIndex}
                                    data={column}
                                    __={__}
                                    setPopup={setPopup}
                                    empty={whether_empty}
                                    setProject={setProject}
                                    hooks={{
                                        onUpdateColumn,
                                        onDeleteColumn,
                                        onAddColumn
                                    }}
                                />
                            ))}
                            <div className="w-25 kanban-item radius-12 overflow-hidden">
                                <div className="card p-0 radius-12 overflow-hidden shadow-none">
                                    <div className="card-body p-24">
                                        <button
                                            type="button"
                                            className="add-kanban d-flex align-items-center gap-2 fw-medium w-100 text-primary-600 justify-content-center text-hover-primary-800 line-height-1"
                                            onClick={() => setProject(prev => ({...prev, columns: [...prev.columns, {id: null, contract_id: contract_id, title: '', sort_order: prev.columns.length, cards: []}]}))}
                                        >
                                            <CirclePlus className="icon text-xl d-flex" /> 
                                            {__('Add Column')}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/*  */}
            </div>
        </div>
    )
}


const EditCard = ({data, onUpdateCard, __, setPopup}) => {
    const [loading, setLoading] = useState(null);
    const [card, setCard] = useState(data);
    
    return (
        <div>
            <h6 className="modal-title text-xl mb-0">{__('Add New Task')}</h6>
            <div>
                <form id="taskForm">
                    <input type="hidden" id="editTaskId" value="" />
                    <div className="mb-3">
                        <label htmlFor="taskTitle" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Title')}</label>
                        <input type="text" className="form-control" placeholder="Enter card Title " id="taskTitle" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="taskTag" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Tag')}</label>
                        <input type="text" className="form-control" placeholder="Enter tag" id="taskTag" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="startDate" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Start Date')}</label>
                        <input type="date" className="form-control" id="startDate" required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="taskDescription" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Description')}</label>
                        <textarea className="form-control" id="taskDescription" rows="3" placeholder="Write some text" required></textarea>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="taskImage" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Attachments')} <span className="text-sm">(Jpg, Png format)</span></label>
                        <input type="file" className="form-control" id="taskImage" />
                        <img id="taskImagePreview" src="assets/images/carousel/carousel-img1.png" alt={__('Image Preview')} />
                    </div>
                    <div className="xpo_flex xpo_flex-nowrap xpo_gap-5 xpo_items-center xpo_justify-end">
                        <button type="button" className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-50 py-11 radius-8" onClick={() => setPopup(null)}>{__('Cancel')}</button>
                        <button type="button" className="btn btn-primary border border-primary-600 text-md px-28 py-12 radius-8">{__('Save Changes')}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}


const SingleColumn = ({ data, __, setPopup, empty, setProject, hooks={} }) => {
    const { onUpdateColumn, onDeleteColumn, onAddColumn } = hooks;
    const { contract_id } = useParams();
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);
    const [column, setColumn] = useState(null);
    const [menuOpened, setMenuOpened] = useState(false);
    
    useEffect(() => {
        setColumn(data);
        if (column === null && data && data.id !== null) {return;}
        const isCreating = data.id === null;data.id = data.id === null ? 0 : data.id;
        request(rest_url(`/partnership/v1/columns/${data.id}`), {method: 'POST', headers: {"Content-Type": "application/json"}, body: JSON.stringify({...data, cards: null})})
        .then(res => onUpdateColumn(res))
        .then(() => notify.success(isCreating ? __('Column created successfully!') : __('Column updated successfully!')))
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
        // .finally(() => setPopup(null));
    }, [data]);

    useEffect(() => {
        if (menuOpened && buttonRef.current && dropdownRef.current) {
            createPopper(buttonRef.current, dropdownRef.current, {
                placement: 'bottom-end',
                modifiers: [
                    {
                        name: 'offset', options: {offset: [0, 10]}
                    },
                ],
            });
        }
    }, [menuOpened]);

    const onAddCard = (data) => {
        column.cards = [...column.cards, data];
        setProject(prev => ({...prev, columns: prev.columns.map(col => col.id === column.id ? column : col)}));
        return Promise.resolve(true);
    }

    const onUpdateCard = (data) => {
        column.cards = column.cards.filter(c => c.id !== data.id);
        setProject(prev => ({...prev, columns: prev.columns.map(col => col.id === column.id ? column : col)}));
        return Promise.resolve(true);
    }

    const onDeleteCard = (data) => {
        column.cards = column.cards.filter(c => c.id !== data.id);
        setProject(prev => ({...prev, columns: prev.columns.map(col => col.id === column.id ? column : col)}));
        return Promise.resolve(true);
    }
    
    return (
        <div className="w-25 xpo_w-80 kanban-item radius-12 pending-card">
            <div className="card p-0 radius-12 overflow-hidden shadow-none">
                <div className="card-body p-0 pb-24">
                    <div className="d-flex align-items-center gap-2 justify-content-between ps-24 pt-24 pe-24">
                        <h6 className="text-lg fw-semibold mb-0">{empty(column?.title, __('Untitled column'))}</h6>
                        <div className="d-flex align-items-center gap-3 justify-content-between mb-0">
                            <button type="button" className="text-2xl hover-text-primary add-task-button" onClick={() => onAddCard({id: null, column_id: column.id, title: '', description: '', tags: [], created_at: Date.now(), updated_at: Date.now()})}>
                                <CirclePlus className="icon" />
                            </button>
                            <div className="dropdown">
                                <button type="button" onClick={() => setMenuOpened(true)} ref={buttonRef}>
                                    <EllipsisVertical className="text-xl" />
                                </button>
                                {menuOpened && <div className="xpo_fixed xpo_top-0 xpo_left-0 xpo_w-full xpo_h-full xpo_z-10" onClick={(e) => setMenuOpened(false)}></div>}
                                <ul className={ `dropdown-menu p-12 border bg-base shadow ${menuOpened ? 'show' : null}` } ref={dropdownRef}>
                                    <li>
                                        <button
                                            onClick={() => onAddColumn({...column, id: null}).then(() => setMenuOpened(false))}
                                            className="duplicate-button dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900 d-flex align-items-center gap-2"
                                        >
                                            <Copy className="text-xl" />
                                            {__('Duplicate')}
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setMenuOpened(false);
                                                setPopup(
                                                    <div className="xpo_relative xpo_max-w-sm xpo_flex xpo_flex-col xpo_gap-5">
                                                        <h6 className="xpo_text-primary-500 text-lg fw-semibold">{__('Are you sure you want to delete this Column? This can\'t be undone!')}</h6>
                                                        <div className="xpo_flex xpo_flex-nowrap xpo_gap-5 xpo_items-center xpo_justify-end">
                                                            <button className="btn btn-light-100 text-dark radius-8 px-15 py-6" onClick={() => setPopup(null)}>{__('No, cancel')}</button>
                                                            <button className="btn btn-danger-600 radius-8 px-15 py-6" onClick={(e) => {
                                                                e.preventDefault();
                                                                request(rest_url(`/partnership/v1/columns/${column.id}`), {method: 'DELETE',})
                                                                .then(data => notify.success(__('Column deleted successfully!')))
                                                                .then(() => onDeleteColumn(column))
                                                                .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
                                                                .finally(() => setPopup(null));
                                                            }}>{__('Yes, I\'m sure')}</button>
                                                        </div>
                                                    </div>
                                                );
                                            }}
                                            className="delete-button dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900 d-flex align-items-center gap-2"
                                        >
                                            <Trash2 className="text-xl" />
                                            {__('Delete')}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
        
                    <div className="connectedSortable ps-24 pt-24 pe-24" id="sortable2">
                        {(column?.cards??[]).map((card, cardIndex) => (
                            <SingleCard
                                key={cardIndex}
                                data={card}
                                __={__}
                                setPopup={setPopup}
                                empty={empty}
                                setProject={setProject}
                                hooks={{
                                    onUpdateCard,
                                    onDeleteCard,
                                    onAddCard
                                }}
                            />
                        ))}
                    </div>
                    
                    <button type="button" className="d-flex align-items-center gap-2 fw-medium w-100 text-primary-600 justify-content-center text-hover-primary-800 add-task-button" onClick={() => onAddCard({id: null, column_id: column.id, title: '', description: '', sort_order: column.cards?.length??0, tags: [], created_at: Date.now(), updated_at: Date.now()})}>
                        <CirclePlus className="icon text-xl" />
                        {__('Add Card')}
                    </button>
                </div>
            </div>
        </div>
    )
}

const SingleCard = ({ data, __, setPopup, empty, setProject, hooks={} }) => {
    const { onUpdateCard, onDeleteCard, onAddCard } = hooks;
    const { contract_id } = useParams();
    const [card, setCard] = useState(null);
    const [inited, setInited] = useState(false);

    useEffect(() => {
        setCard(data);
        if (card === null && data && data.id !== null) {return;}
        const isCreating = data.id === null;data.id = data.id === null ? 0 : data.id;
        request(rest_url(`/partnership/v1/cards/${data.id}`), {method: 'POST', headers: {"Content-Type": "application/json"}, body: JSON.stringify({...data})})
        .then(res => onUpdateCard(res))
        .then(() => notify.success(isCreating ? __('Card created successfully!') : __('Card updated successfully!')))
        .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
        // .finally(() => setPopup(null));
    }, [data]);
    
    return (
        <div
            onClick={(e) => setPopup(
                <CardViewer
                    data={card}
                    __={__}
                    setPopup={setPopup}
                    empty={empty}
                    setProject={setProject}
                    hooks={{
                        ...hooks
                    }}
                />
            )}
            className={ `kanban-card bg-neutral-50 p-16 radius-8 mb-24 xpo_cursor-pointer` }
        >
            <h6 className="kanban-title text-lg fw-semibold mb-8">{empty(card?.title, __('Untitled card'))}</h6>
            <p className="kanban-desc text-secondary-light xpo_text-ellipsis xpo_line-clamp-3 xpo_leading-normal">{card?.description}</p>
            {(card?.tags??[]).map((tag, tagIndex) => (
                <button key={tagIndex} type="button" className="btn text-primary-600 border rounded border-primary-600 bg-hover-primary-600 text-hover-white d-flex align-items-center gap-2">
                    <Tag className="icon" /><span className="kanban-tag fw-semibold">{tag}</span>
                </button>
            ))}
            <div className="mt-12 d-flex align-items-center justify-content-between gap-10">
                <div className="d-flex align-items-center justify-content-between gap-10">
                    <CalendarDays className="text-primary-light" />
                    <span className="start-date text-secondary-light">{strtotime(card?.updated_at??0).format('DD MMM YYYY')}</span>
                </div>
                <div className="d-flex align-items-center justify-content-between gap-10 xpo_relative">
                    <button
                        type="button"
                        className="card-edit-button text-success-600"
                        onClick={(e) => setPopup(<EditCard data={card} onUpdateCard={(data) => {
                            column.cards = column.cards.map(c => c.id === card.id ? data : c);
                            setProject(prev => ({...prev, columns: prev.columns.map(col => col.id === column.id ? column : col)}));
                        }} __={__} setPopup={setPopup} />)}
                    >
                        <SquarePen className="icon text-lg line-height-1" />
                    </button>
                    <button
                        type="button"
                        className="card-delete-button text-danger-600"
                        onClick={(e) => {
                            e.preventDefault();
                            setPopup(
                                <div className="xpo_relative xpo_max-w-sm xpo_flex xpo_flex-col xpo_gap-5">
                                    <h6 className="xpo_text-primary-500 text-lg fw-semibold">{__('Are you sure you want to delete this card? This can\'t be undone!')}</h6>
                                    <div className="xpo_flex xpo_flex-nowrap xpo_gap-5 xpo_items-center xpo_justify-end">
                                        <button className="btn btn-light-100 text-dark radius-8 px-15 py-6" onClick={() => setPopup(null)}>{__('No, cancel')}</button>
                                        <button className="btn btn-danger-600 radius-8 px-15 py-6" onClick={(e) => {
                                            e.preventDefault();
                                            // contracts/${contract_id}/
                                            request(rest_url(`/partnership/v1/cards/${card.id}`), {method: 'DELETE',})
                                            .then(data => notify.success(__('Card deleted successfully!')))
                                            .then(() => onDeleteCard(card))
                                            .catch(err => notify.error(err?.response?.message??err?.message??__('Something went wrong!')))
                                            .finally(() => setPopup(null));
                                        }}>{__('Yes, I\'m sure')}</button>
                                    </div>
                                </div>
                            );
                        }}
                    >
                        <Trash2 className="icon text-lg line-height-1" />
                    </button>
                    <div className="xpo_absolute xpo_top-0 xpo_left-0 xpo_h-full xpo_w-full"></div>
                </div>
            </div>
        </div>
    );
}
const CardViewer = ({ data, __, setPopup, empty, setProject, hooks={} }) => {
    const { onUpdateCard, onDeleteCard, onAddCard } = hooks;
    const { contract_id } = useParams();
    const [card, setCard] = useState({...data});
    const [inited, setInited] = useState(false);
    const [labels, setLabels] = useState([]);
    const [comments, setComments] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myUserID, setMyUserID] = useState(0);
    const [members, setMembers] = useState([]);
    const [ShowPops, setShowPops] = useState(null);

    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    const error_handler = (err) => {
        // request.error_notify(err, __);
    };

    const fetch_all = async () => {
        await request(rest_url(`/partnership/v1/cards/${card.id}/comments`), {method: 'GET'}).then(res => setComments(res)).catch(error_handler);
        await request(rest_url(`/partnership/v1/cards/${card.id}/checklists`), {method: 'GET'}).then(res => setChecklists(
            res.map(i => ({...i, is_completed: parseInt(i.is_completed) === 1}))
        )).catch(error_handler);
        await request(rest_url(`/partnership/v1/cards/${card.id}/attachments`), {method: 'GET'}).then(res => setAttachments(res)).catch(error_handler);
    }
    useEffect(() => {
        try {
            fetch_all();
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (card === null || !data || !data?.id) {return;}
            // onUpdateCard(card);
            console.log(card);
        }, 2000); // 2000ms = 2 second delay

        return () => clearTimeout(delayDebounce);
    }, [card]);

    useEffect(() => {
        if (ShowPops && buttonRef.current && dropdownRef.current) {
            createPopper(buttonRef.current, dropdownRef.current, {
                placement: 'bottom-end',
                modifiers: [
                    {
                        name: 'offset', options: {offset: [0, 10]}
                    },
                ],
            });
        }
    }, [ShowPops]);

    const update_checklist = (cItem) => {
        const update = (cItem, isCreating, resolve) => {
            cItem.id = isCreating ? Date.now() : cItem.id;
            request(rest_url(`/partnership/v1/cards/${card.id}/checklist`), {method: 'POST', headers: {"Content-Type": "application/json"}, body: JSON.stringify({...cItem, id: isCreating ? 0 : cItem.id})})
            .then(res => isCreating && setChecklists(prev => isCreating ? [...prev, res] : prev.map(i => i.id === cItem.id ? cItem : i)))
            .catch(err => request.error_notify(err, __))
            .finally(() => resolve(true))
        }
        const isCreating = cItem.id === null;
        if (isCreating) {
            return new Promise((resolve, reject) => update(cItem, isCreating, resolve));
        } else {
            update(cItem, isCreating, Promise.resolve);
            setChecklists(prev => prev.map(i => i.id === cItem.id ? cItem : i));
            return true;
        }
    }
    
    return (
        <div className="xpo_w-[1000px] xpo_max-w-full">
            <div className="xpo_flex xpo_flex-col xpo_w-full xpo_gap-3">
                <div className="xpo_block xpo_relative">
                    <div className="xpo_grid xpo_grid-cols-1 md:xpo_grid-cols-[3fr_1fr] xpo_gap-5 xpo_overflow-auto xpo_max-h-[60vh]">
                        <div className="xpo_flex xpo_flex-col xpo_gap-3 xpo_p-3">
                            <div className="xpo_grid xpo_grid-cols-[0px_1fr] hover:xpo_grid-cols-[40px_1fr] xpo_gap-2 xpo_transition-all xpo_delay-75 xpo_items-center">
                                <div className="xpo_overflow-hidden">
                                    <div className="form-switch switch-primary xpo_flex xpo_justify-center">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            role="switch"
                                            checked={card?.is_completed??false}
                                            onChange={(e) => {
                                                setCard(prev => ({...prev, is_completed: e.target.checked}));
                                                request(rest_url(`/partnership/v1/cards/${card.id}`), {method: 'POST', headers: {"Content-Type": "application/json"}, body: JSON.stringify({...card, is_completed: e.target.checked})})
                                                // .then(res => onUpdateCard(res))
                                                .catch(err => request.error_notify(err, __))
                                            }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <input
                                        type="text"
                                        onBlur={(e) => {
                                            e.preventDefault();
                                            request(rest_url(`/partnership/v1/cards/${card.id}`), {method: 'POST', headers: {"Content-Type": "application/json"}, body: JSON.stringify({...card, title: e.target.value})})
                                            // .then(res => onUpdateCard(res))
                                            .catch(err => request.error_notify(err, __))
                                        }}
                                        value={empty(card?.title, __('Untitled card'))}
                                        onChange={(e) => setCard(prev => ({...prev, title: e.target.value}))}
                                        className="xpo_w-full form-control xpo_border-none focus:xpo_border-solid xpo_font-bold xpo_py-2 xpo_px-3 xpo_text-2xl"
                                    />
                                </div>
                            </div>
                            <div className="xpo_grid xpo_grid-cols-[30px_1fr] xpo_gap-2 xpo_items-start">
                                <div>
                                    <AlignLeft className="xpo_block xpo_mt-1" />
                                </div>
                                <textarea
                                rows="3"
                                value={card?.description}
                                onChange={(e) => setCard(prev => ({...prev, description: e.target.value}))}
                                onBlur={(e) => {
                                    e.preventDefault();
                                    request(rest_url(`/partnership/v1/cards/${card.id}`), {method: 'POST', headers: {"Content-Type": "application/json"}, body: JSON.stringify({...card, description: e.target.value})})
                                    // .then(res => onUpdateCard(res))
                                    .catch(err => request.error_notify(err, __))
                                }}
                                className="xpo_w-full form-control xpo_border-none focus:xpo_border-solid xpo_py-2 xpo_px-3 xpo_text-lg"
                                ></textarea>
                            </div>
                            {attachments?.length ? (
                                <div className="xpo_grid xpo_grid-cols-[30px_1fr] xpo_gap-2 xpo_items-start">
                                    <div>
                                        <Paperclip className="xpo_block xpo_mt-1" />
                                    </div>
                                    <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                        <div className="xpo_font-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Attachments')}</div>
                                        <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                            {attachments.map((attachment, attachmentIndex) => (
                                                <div key={attachmentIndex} className="xpo_flex xpo_flex-nowrap xpo_items-center xpo_gap-2">
                                                    <img src={attachment?.url} alt={attachment?.name} className="xpo_w-10 xpo_h-10 xpo_object-cover xpo_border-radius-8" />
                                                    <div className="xpo_flex xpo_flex-col xpo_gap-1">
                                                        <span className="xpo_text-sm xpo_font-semibold">{attachment?.name}</span>
                                                        <span className="xpo_text-xs xpo_text-secondary-light">{attachment?.size}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {checklists?.length ? (
                                <div className="xpo_grid xpo_grid-cols-[30px_1fr] xpo_gap-2 xpo_items-start">
                                    <div>
                                        <ListTodo className="xpo_block xpo_mt-1" />
                                    </div>
                                    <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                        <h6 className="xpo_font-semibold xpo_text-primary-light xpo_text-md">{__('Checklist')}</h6>
                                        <div className="xpo_flex xpo_flex-col xpo_gap-0">
                                            {checklists.map((item, itemIndex) => (
                                                <div key={itemIndex} className="xpo_flex xpo_flex-nowrap xpo_items-center xpo_gap-2">
                                                    <input type="checkbox" className="form-check-input" checked={item?.is_completed} onChange={(e) => update_checklist({...item, is_completed: e.target.checked})} />
                                                    <input
                                                        type="text"
                                                        className="xpo_w-full form-control xpo_border-none focus:xpo_border-solid xpo_py-1 xpo_px-2 xpo_h-4"
                                                        value={item?.title} onChange={(e) => setChecklists(prev => prev.map(i => i.id === item.id ? {...i, title: e.target.value} : i))}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') {
                                                                e.preventDefault();
                                                                e.target.blur();
                                                            }
                                                        }}
                                                        onBlur={(e) => update_checklist({...item, title: e.target.value})} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            {comments?.length ? (
                                <div className="xpo_grid xpo_grid-cols-[30px_1fr] xpo_gap-2 xpo_items-start">
                                    <div>
                                        <ListTodo className="xpo_block xpo_mt-1" />
                                    </div>
                                    <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                        <div className="xpo_font-semibold xpo_text-primary-light xpo_text-sm xpo_mb-8">{__('Comments')}</div>
                                        <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                            {comments.map((item, itemIndex) => (
                                                <div key={itemIndex} className="xpo_flex xpo_flex-nowrap xpo_items-center xpo_gap-2">
                                                    <input type="text" className="xpo_w-full form-control xpo_border-none focus:xpo_border-solid xpo_py-2 xpo_px-3" value={item?.comment} onChange={(e) => setComments(prev => prev.map(i => i.id === item.id ? {...i, comment: e.target.checked} : i))} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                            
                        </div>
                        <div className="xpo_flex xpo_flex-col xpo_gap-3 xpo_sticky xpo_top-4 xpo_self-start">
                            <div className="xpo_grid xpo_grid-cols-[1fr_1fr] xpo_gap-2">
                                <div className="xpo_flex xpo_flex-col xpo_gap-3">
                                    <label htmlFor="taskTag" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Tag')}</label>
                                    <input type="text" className="form-control" placeholder="Enter tag" id="taskTag" value={card?.tags??[]} onChange={(e) => setCard(prev => ({...prev, tags: e.target.value.split(',')}))} />
                                </div>
                                <div className="xpo_flex xpo_flex-col xpo_gap-3">
                                    <label htmlFor="startDate" className="form-label fw-semibold text-primary-light text-sm mb-8">{__('Start Date')}</label>
                                    <input type="date" className="form-control" id="startDate" value={strtotime(card?.updated_at??0).format('YYYY-MM-DD')} onChange={(e) => setCard(prev => ({...prev, updated_at: strtotime(e.target.value).format('YYYY-MM-DD HH:mm:ss')}))} />
                                </div>
                            </div>
                            <div className="xpo_flex xpo_flex-col xpo_gap-2 xpo_px-3 xpo_py-4">
                                {members?.length ? (
                                    <button
                                        type="button"
                                        className="btn btn-light-100 text-dark radius-8 px-14 py-6 text-sm xpo_flex xpo_justify-start xpo_items-center xpo_gap-2"
                                        onClick={(e) => setMembers(prev => prev.map(m => m.id === myUserID ? {...m, is_member: !m.is_member} : m))}
                                    >
                                        {! members.some(m => m.id == myUserID) ? <UserPlus /> : <UserMinus />}
                                        <span>{__('Join')}</span>
                                    </button>
                                ) : null}
                                {members?.length ? (
                                    <button
                                        type="button"
                                        className="btn btn-light-100 text-dark radius-8 px-14 py-6 text-sm xpo_flex xpo_justify-start xpo_items-center xpo_gap-2"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setShowPops(() => () => 
                                                <div className="xpo_flex xpo_flex-col xpo_gap-3">
                                                    <h6 className="xpo_text-primary-500 text-lg fw-semibold">{__('Members')}</h6>
                                                    <div className="xpo_flex xpo_flex-col xpo_gap-2">
                                                        {members.map((member, memberIndex) => (
                                                            <div key={memberIndex} className="xpo_flex xpo_flex-nowrap xpo_items-center xpo_gap-2">
                                                                <img src={member?.avatar} alt={member?.name} className="xpo_w-10 xpo_h-10 xpo_object-cover xpo_border-radius-8" />
                                                                <span className="xpo_text-sm xpo_font-semibold">{member?.name}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        }}
                                    >
                                        <User />
                                        <span>{__('Members')}</span>
                                    </button>
                                ) : null}
                                {labels?.length ? (
                                    <button
                                        type="button"
                                        className="btn btn-light-100 text-dark radius-8 px-14 py-6 text-sm xpo_flex xpo_justify-start xpo_items-center xpo_gap-2"
                                    >
                                        <Tag />
                                        <span>{__('Labels')}</span>
                                    </button>
                                ) : null}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setShowPops(() => () => {
                                            const defaultObj = {id: null, card_id: card.id, title: __('Checklist'), is_completed: false};
                                            const [check, setCheck] = useState({...defaultObj, sort_order: checklists.length});
                                            return (
                                                <div className="xpo_flex xpo_flex-col xpo_gap-3">
                                                    <h6 className="xpo_text-primary-500 text-lg fw-semibold">
                                                        <input
                                                            type="text"
                                                            value={check?.title}
                                                            className="xpo_w-full form-control xpo_border-none focus:xpo_border-solid xpo_py-2 xpo_px-3"
                                                            onChange={(e) => setCheck(prev => ({...prev, title: e.target.value}))}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    e.preventDefault();
                                                                    update_checklist(check).then(() => setCheck({...defaultObj, sort_order: checklists.length}));
                                                                }
                                                            }}
                                                            onBlur={(e) => setShowPops(null)}
                                                        />
                                                    </h6>
                                                </div>
                                            )
                                        });
                                    }}
                                    className="btn btn-light-100 text-dark radius-8 px-14 py-6 text-sm xpo_flex xpo_justify-start xpo_items-center xpo_gap-2"
                                >
                                    <SquareCheckBig />
                                    <span>{__('Checklist')}</span>
                                </button>


                                <div
                                    className={ `card xpo_p-3 xpo_py-5 xpo_w-80 xpo_max-w-full xpo_shadow-lg xpo_border-radius-8 ${!ShowPops ? 'xpo_hidden' : null}` }
                                >
                                    {ShowPops && <ShowPops />}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}