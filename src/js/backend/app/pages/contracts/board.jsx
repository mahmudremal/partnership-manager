import React, { use, useEffect, useState } from "react";
import { home_url, rest_url, notify, strtotime } from "@functions";
import request from "@common/request";
import { Link } from '@common/link';
import { usePopup } from '@context/PopupProvider';
import { useTranslation } from '@context/LanguageProvider';
import { useParams } from "react-router-dom";
import { CalendarDays, CirclePlus, Copy, EllipsisVertical, SquarePen, Tag, Trash2 } from "lucide-react";


export default function Contract_Board() {
    const { __ } = useTranslation();
    const { setPopup } = usePopup();
    const { contract_id } = useParams();
    const [loading, setLoading] = useState(true);
    const [project, setProject] = useState({columns: []});

    
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
                                <div key={columnIndex} className="w-25 kanban-item radius-12 pending-card">
                                    <div className="card p-0 radius-12 overflow-hidden shadow-none">
                                        <div className="card-body p-0 pb-24">
                                            <div className="d-flex align-items-center gap-2 justify-content-between ps-24 pt-24 pe-24">
                                                <h6 className="text-lg fw-semibold mb-0">{column.title}</h6>
                                                <div className="d-flex align-items-center gap-3 justify-content-between mb-0">
                                                    <button type="button" className="text-2xl hover-text-primary add-task-button">
                                                        <CirclePlus className="icon" />
                                                    </button>
                                                    <div className="dropdown">
                                                        <button type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                            <EllipsisVertical className="text-xl" />
                                                        </button>
                                                        <ul className="dropdown-menu p-12 border bg-base shadow">
                                                            <li>
                                                                <a className="duplicate-button dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900 d-flex align-items-center gap-2" href="javascript:void(0)">
                                                                    <Copy className="text-xl" />
                                                                    {__('Duplicate')}
                                                                </a>
                                                            </li>
                                                            <li>
                                                                <a className="delete-button dropdown-item px-16 py-8 rounded text-secondary-light bg-hover-neutral-200 text-hover-neutral-900 d-flex align-items-center gap-2" href="javascript:void(0)">
                                                                    <Trash2 className="text-xl" />
                                                                    {__('Delete')}
                                                                </a>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                
                                            <div className="connectedSortable ps-24 pt-24 pe-24" id="sortable2">
                                                {column.cards?.map((card, cardIndex) => (
                                                    <div className="kanban-card bg-neutral-50 p-16 radius-8 mb-24">
                                                        <h6 className="kanban-title text-lg fw-semibold mb-8">{card.title}</h6>
                                                        <p className="kanban-desc text-secondary-light xpo_text-ellipsis xpo_line-clamp-3 xpo_leading-normal">{card.description}</p>
                                                        {(card?.tags??[]).map((tag, tagIndex) => (
                                                            <button key={tagIndex} type="button" className="btn text-primary-600 border rounded border-primary-600 bg-hover-primary-600 text-hover-white d-flex align-items-center gap-2">
                                                                <Tag className="icon" /><span className="kanban-tag fw-semibold">{tag}</span>
                                                            </button>
                                                        ))}
                                                        <div className="mt-12 d-flex align-items-center justify-content-between gap-10">
                                                            <div className="d-flex align-items-center justify-content-between gap-10">
                                                                <CalendarDays className="text-primary-light" />
                                                                <span className="start-date text-secondary-light">{strtotime(card.updated_at).format('DD MMM YYYY')}</span>
                                                            </div>
                                                            <div className="d-flex align-items-center justify-content-between gap-10">
                                                                <button
                                                                    type="button"
                                                                    className="card-edit-button text-success-600"
                                                                    onClick={(e) => setPopup(
                                                                        <div className="xpo_relative xpo_max-w-sm xpo_flex xpo_flex-col xpo_gap-5">
                                                                            Editor
                                                                        </div>
                                                                    )}
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
                                                                                <h6 class="xpo_text-primary-500 text-lg fw-semibold">{__('Are you sure you want to delete this card? This can\'t be undone!')}</h6>
                                                                                <div className="xpo_flex xpo_flex-nowrap xpo_gap-5 xpo_items-center xpo_justify-end">
                                                                                    <button className="btn btn-light-100 text-dark radius-8 px-15 py-6" onClick={() => setPopup(null)}>{__('No, cancel')}</button>
                                                                                    <button className="btn btn-danger-600 radius-8 px-15 py-6" onClick={(e) => {
                                                                                        e.preventDefault();
                                                                                        request(rest_url(`/partnership/v1/contracts/${contract_id}/cards/${card.id}`), {method: 'DELETE',})
                                                                                        .then(data => notify.success(__('Card deleted successfully!')))
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
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            <button type="button" className="d-flex align-items-center gap-2 fw-medium w-100 text-primary-600 justify-content-center text-hover-primary-800 add-task-button">
                                                <CirclePlus className="icon text-xl" />
                                                {__('Add Card')}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div className="w-25 kanban-item radius-12 overflow-hidden">
                                <div className="card p-0 radius-12 overflow-hidden shadow-none">
                                    <div className="card-body p-24">
                                        <button type="button" className="add-kanban d-flex align-items-center gap-2 fw-medium w-100 text-primary-600 justify-content-center text-hover-primary-800 line-height-1">
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