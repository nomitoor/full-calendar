// resources/js/components/HelloReact.js

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";

export default function HelloReact() {
    const [data, setData] = useState([]);
    const [backupData, setBackupData] = useState([]);
    const [staffNumbers, setStaffNumbers] = useState([]);
    const [formData, setFormData] = useState([]);
    const [requestFlag, setRequestFlag] = useState(true);
    const monthList = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const startYear = 2020;
    const endYear = 2030;
    const yearList = Array(endYear - startYear + 1)
        .fill()
        .map((_, idx) => startYear + idx);

    useEffect(() => {
        if (data.length <= 0 && requestFlag) {
            axios.get("/getData").then((response) => {
                if (response.data.length > 0) {
                    const staff = response.data.map((i) => i.STR_STAFF_NBR);
                    setStaffNumbers(staff);
                    let objData = response.data.map((item, key) => {
                        const obj_date = item.DATE;
                        let start_time = item.STARTTIME ?? "";
                        let end_time = item.ENDTIME ?? "";
                        start_time = new Date(
                            (obj_date + "T" + start_time).replace(/T\s*$/, "")
                        );
                        end_time = new Date(
                            (obj_date + "T" + end_time).replace(/T\s*$/, "")
                        );
                        const startDateTime = new Date(
                            start_time.getTime() +
                                start_time.getTimezoneOffset() * 60000
                        ).toISOString();
                        const endDateTime = new Date(
                            end_time.getTime() +
                                end_time.getTimezoneOffset() * 60000
                        ).toISOString();

                        return {
                            id: key,
                            title: item.STR_STAFF_NBR,
                            start: startDateTime,
                            end: endDateTime,
                            editable: true,
                            dateInfo: item.DATE,
                            day_type: item.DAY_TYPE,
                            description: item.TXT_DAY_DESCRIPTION,
                        };
                    });
                    setData(objData);
                    setBackupData(objData);
                    setRequestFlag(false);
                }
            });
        }
    });

    const handleFormSubmit = (event) => {
        event.preventDefault();
        const filter_staff =
            formData.staff_num !== "none" ? formData.staff_num : undefined;
        const filter_month =
            formData.month !== "none" ? formData.month : undefined;
        const filter_year =
            formData.year !== "none" ? formData.year : undefined;
        var stateData = [...backupData];
        if (stateData) {
            stateData = stateData.filter((item) => {
                const date = new Date(item.dateInfo);
                const monthString = date.toLocaleString("default", {
                    month: "long",
                });
                const yearString = date.getFullYear().toString();
                if (
                    (filter_staff === undefined ||
                        item.title === filter_staff) &&
                    (filter_month === undefined ||
                        monthString === filter_month) &&
                    (filter_year === undefined || yearString === filter_year)
                ) {
                    return item;
                }
            });
            setData(stateData);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEventDrop = (event) => {
        const stateData = [...data];
        const index = stateData.findIndex((e) => e.id === event.event.id);
        stateData[index] = event.event.toPlainObject();
        setData(stateData);
    };

    const handleCustomButtonClick = () => {};

    return (
        <div className="row justify-content-center">
            <div className="col-8">
                <div>
                    <form onSubmit={handleFormSubmit}>
                        <div>
                            <select
                                className="form-select d-inline"
                                name="staff_num"
                                onChange={handleChange}
                            >
                                <option value="none">
                                    --Select Staff Number--
                                </option>
                                {staffNumbers.map((item, key) => {
                                    return (
                                        <option value={item} key={key}>
                                            {item}
                                        </option>
                                    );
                                })}
                            </select>
                            <select
                                className="form-select d-inline"
                                name="month"
                                onChange={handleChange}
                            >
                                <option value="none">--Select Month--</option>
                                {monthList.map((item, key) => {
                                    return (
                                        <option value={item} key={key}>
                                            {item}
                                        </option>
                                    );
                                })}
                            </select>
                            <select
                                className="form-select d-inline"
                                name="year"
                                onChange={handleChange}
                            >
                                <option value="none">--Select Year--</option>
                                {yearList.map((item, key) => {
                                    return (
                                        <option value={item} key={key}>
                                            {item}
                                        </option>
                                    );
                                })}
                            </select>
                            <button
                                type="submit"
                                className="btn btn-primary mb-3"
                            >
                                Filter
                            </button>
                        </div>
                    </form>
                </div>
                <FullCalendar
                    plugins={[interactionPlugin, timeGridPlugin]}
                    slotDuration={"00:15:00"}
                    headerToolbar={{
                        left: "prev,next today",
                        center: "title",
                        right: "customButton",
                    }}
                    customButtons={{
                        customButton: {
                            text: "Update Changes",
                            className: "btn btn-primary",
                            click: handleCustomButtonClick,
                        },
                    }}
                    editable={true}
                    selectable={true}
                    // selectMirror={true}
                    droppable={true}
                    eventDrop={handleEventDrop}
                    events={data}
                    eventClick={(info) => {
                        alert(
                            `
                            Event: ${info.event.title}
                            Day: ${info.event.extendedProps.day_type}
                            Description: ${info.event.extendedProps.description}
                            `
                        );
                    }}
                />
            </div>
        </div>
    );
}

if (document.getElementById("hello-react")) {
    ReactDOM.render(<HelloReact />, document.getElementById("hello-react"));
}
