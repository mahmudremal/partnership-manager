import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import 'react-phone-input-2/lib/style.css';
import request from '@common/request';
import { home_url, rest_url, notify, sleep, strtotime } from '@functions';
import { ChevronsLeft, ChevronsRight, Eye, Loader, Save, SquarePen, Store, Trash2, X } from "lucide-react";

const __ = (t, d = null) => t;

const taskTypeLabels = {
  plugin_activation_review: 'Plugin',
  seo_improvements: 'SEO',
  new_user_onboarding: 'User Onboarding',
  media_seo: 'Media SEO'
};

const TaskTable = ({ config }) => {
  console.log(config)
  const [statuses, setStatuses] = useState(config?.statuses??[]);
  const [taskTypes, setTaskTypes] = useState(config?.task_types??[]);
  const [pagination, setPagination] = useState({total: 1, totalPages: 1});
  const [tableItems, setTableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    search: '',
    per_page: 20,
    status: 'pending',
    task_type: 'all',
    orderby: 'id',
    order: 'desc'
  });
  
  useEffect(() => {
    // if (!form) {return;}
    // if (first) {setFirst(false);return;}
    const handler = setTimeout(() => {
      setLoading(true);
      axios.get(`https://${location.host}/wp-json/partnership/v1/tasks?${
        Object.keys(filters).map((key, i) => `${key}=${__(filters[key])}`).join('&')
      }`, {
        headers: {
          'Content-Type': 'application/json',
          // 'X-WP-Nonce': config?._nonce
        },
        // withCredentials: true
      })
      .then(res => {
        setPagination(prev => ({...prev, total: parseInt(res.headers.get('x-wp-total')), totalPages: parseInt(res.headers.get('x-wp-totalpages'))}));
        setTableItems(res.data);
      })
      .catch(err => {
        notify.error(err?.response?.data?.message??err?.message??__('Something went wrong!'), {position: 'bottom-right'})
      })
      .finally(() => setLoading(false));
    }, 2000);

    return () => clearTimeout(handler);
  }, [filters]);
  
  return (
    <div className="card h-100 p-0 radius-12 xpo_w-full xpo_max-w-full">
      <div className="card-header">
        <div className="xpo_flex xpo_items-center xpo_justify-between">
          <h5 className="card-title mb-0">{__('Tasks')}</h5>
          <div className="card-header-action">
            <div className="xpo_flex xpo_items-center xpo_justify-between xpo_gap-4 xpo_w-full">
              <div className="btn-group radius-8" role="group" aria-label="Default button group">
                {[
                  ['all', __('All')],
                  ...Object.values(taskTypes).map(type => ([type, taskTypeLabels?.[type]??type]))
                ].map(([key, label], index) => (
                  <button key={index} type="button" className={ `btn btn-link text-secondary-light text-decoration-none xpo_p-2 hover:xpo_bg-transparent ${filters.task_type == key && 'xpo_text-primary'}` } onClick={() => setFilters(prev => ({...prev, task_type: key}))}>{label}</button>
                ))}
              </div>
              <div className="xpo_flex xpo_items-center">
                <div className="form-group mb-0 me-3">
                  <input type="text" className="form-control" placeholder={__('Search...')} value={filters.search} onChange={(e) => setFilters({ ...filters, s: e.target.value })} />
                </div>
                <button
                  className="btn btn-primary"
                  onClick={(e) => setPopup(
                    <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, ab.</div>
                  )}
                >{__('Create new task')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table basic-border-table mb-0 xpo_w-full">
            <thead>
              <tr>
                <th className="xpo_text-left">{__('#id')} </th>
                <th className="xpo_text-left">{__('Type')}</th>
                <th className="xpo_text-left">{__('Status')}</th>
                <th className="xpo_text-left">{__('Created at')}</th>
                <th className="xpo_text-center">{__('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="xpo_px-4 xpo_py-6 xpo_text-center">
                    <p className="fw-medium">{__('Loading...')}</p>
                  </td>
                </tr>
              ) : (
                tableItems.length == 0 ? (
                  <tr>
                    <td colSpan={4} className="xpo_px-4 xpo_py-6">
                      <div className="alert alert-warning bg-warning-100 text-warning-600 border-warning-100 px-24 py-11 mb-0 fw-semibold text-lg radius-8" role="alert">
                        <div className="xpo_flex xpo_items-center xpo_justify-between text-lg">
                          {__('No task found!')} 
                        </div>
                        <p className="fw-medium text-warning-600 text-sm mt-8">{__('Create a new task with a proper instruction and assets included and mark as pending to let your agent do the task whenever get free.')}</p>
                      </div>
                    </td>
                  </tr>
                ) : tableItems.map((task, index) => (
                  <tr key={index}>
                    <td className="xpo_capitalize">#{task.id}</td>
                    <td className="xpo_capitalize">{task.task_type}</td>
                    <td className="xpo_capitalize">{task.status}</td>
                    <td className="xpo_capitalize">{strtotime(task.created_at).format('DD MMM, YY')}</td>
                    <td className="xpo_text-center">
                      <div className="xpo_flex xpo_items-center xpo_gap-3 xpo_justify-center">
                        <button
                          onClick={() => setPopup(
                            <div className="xpo_flex xpo_flex-col xpo_gap-4">
                              <div className="xpo_flex xpo_items-center xpo_gap-2">
                                <Store className="text-xxl" /> 
                                <h6 className="text-lg mb-0">{task.task_title}</h6>
                              </div>
                              <div className="xpo_block xpo_mt-2">
                                Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequuntur, deleniti!
                              </div>
                            </div>
                          )}
                          className="bg-info-focus text-info-600 w-40-px h-40-px rounded-circle xpo_flex xpo_justify-center xpo_items-center"
                        ><Eye className="icon text-xl" /></button>
                        <button
                          className="bg-success-focus text-success-600 w-40-px h-40-px rounded-circle xpo_flex xpo_justify-center xpo_items-center"
                          onClick={() => setPopup(
                            <div>Lorem ipsum dolor sit amet consectetur adipisicing elit. Ducimus, ab.</div>
                          )}
                        ><SquarePen className="icon" /></button>
                        <button
                          className="bg-danger-focus text-danger-600 w-40-px h-40-px rounded-circle xpo_flex xpo_justify-center xpo_items-center"
                          onClick={() => setPopup(
                            <div className="xpo_relative xpo_max-w-sm xpo_flex xpo_flex-col xpo_gap-5">
                              <h6 class="xpo_text-primary-500 text-lg fw-semibold">{__('Are you sure you want to delete this task?')}</h6>
                              <div className="xpo_flex xpo_flex-nowrap xpo_gap-5 xpo_items-center xpo_justify-end">
                                <button className="btn btn-light-100 text-dark radius-8 px-15 py-6" onClick={() => setPopup(null)}>{__('No, cancel')}</button>
                                <button className="btn btn-danger-600 radius-8 px-15 py-6" onClick={async (e) => {
                                  e.preventDefault();
                                  e.target.disabled = true;
                                  e.target.innerHTML = __('Deleting...');
                                  await sleep(2000);
                                  axios.delete(`https://${location.host}/wp-json/partnership/v1/tasks/${task?.id}`)
                                  .then(async res => await sleep(2000))
                                  .catch(err => notify.error(err?.response?.data?.message??err?.message??__('Something went wrong!'), {position: 'bottom-right'}))
                                  .finally(() => setPopup(null))
                                }}>{__('Yes, I\'m sure')}</button>
                              </div>
                            </div>
                          )}
                        ><Trash2 className="icon" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="card-footer">
        <div className="xpo_flex xpo_items-center xpo_justify-between xpo_flex-wrap xpo_gap-2 mt-24">
          <span>{sprintf(
            __('Showing %d to %d of %d entries'),
            (filters.page - 1) * filters.per_page + 1,
            Math.min(filters.page * filters.per_page, pagination?.total),
            pagination?.total
          )}</span>
          <ul className="pagination xpo_flex xpo_wrap xpo_items-center xpo_gap-2 xpo_justify-center">
            <li className="page-item">
              <button onClick={() => setFilters(prev => ({...prev, page: filters.page - 1}))} className="page-link bg-neutral-200"> <ChevronsLeft /> </button>
            </li>
            {[...Array(pagination?.totalPages)].map((_, i) => (
              <li key={i + 1} className="page-item">
                <button
                  onClick={(e) => setFilters(prev => ({...prev, page: i + 1}))}
                  className={`page-link ${filters.page === i + 1 ? 'bg-primary-600 text-white' : 'bg-neutral-200'}`}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            <li className="page-item">
              <button onClick={() => setFilters(prev => ({...prev, page: filters.page + 1}))} className="page-link bg-neutral-200"> <ChevronsRight /> </button>
            </li>
          </ul>
        </div>
      </div>
      {popup ? (
        <div className="xpo_fixed xpo_inset-0 xpo_bg-black/40 xpo_flex xpo_justify-center xpo_items-center xpo_z-[10000]">
          <div className="xpo_relative card xpo_rounded-2xl xpo_p-6 xpo_shadow-lg xpo_min-w-[300px] xpo_max-w-[90vw]">
            <button onClick={(e) =>setPopup(null)} className="xpo_absolute xpo_top-2 xpo_right-2 xpo_text-gray-500 hover:xpo_text-black">
              <X className="xpo_w-5 xpo_h-5" />
            </button>
            <div className="card-body">
              {popup}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TaskTable;
