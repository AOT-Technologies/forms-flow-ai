import React from "react";
import { useSelector } from "react-redux";
import { Form } from "react-formio";
import { DeviceFrameset } from 'react-device-frameset';
import "react-device-frameset/dist/styles/marvel-devices.css";
import { formio_resourceBundles } from "../../../resourceBundles/formio_resourceBundles";
import "./styles.css";
import LoadingOverlay from "react-loading-overlay-ts";

const DeviceView = ({ hideComponents, form, deviceView, active }) => {
    const lang = useSelector(state => state.user.lang);
    return (
        <>

            {deviceView && <div className="App">
                <DeviceFrameset device="iPhone 8" color="gold" landscape>
                    <div className="device-container">
                        <Form
                            form={form}
                            hideComponents={hideComponents}
                            options={{
                                disabled: { submit: true },
                                buttonSettings: {
                                    showSubmit: false
                                },
                                disableAlerts: true,
                                noAlerts: true,
                                language: lang,
                                i18n: formio_resourceBundles
                            }}
                        />
                    </div>
                </DeviceFrameset>
                <DeviceFrameset device="iPhone 5s" color="gold">
                    <div className="">
                        <LoadingOverlay
                            active={active}
                            spinner
                            text="Loading..."
                        >
                            <Form
                                form={form}
                                hideComponents={hideComponents}
                                options={{
                                    disabled: { submit: true },
                                    buttonSettings: {
                                        showSubmit: false
                                    },
                                    disableAlerts: true,
                                    noAlerts: true,
                                    language: lang, i18n: formio_resourceBundles
                                }}

                            />
                        </LoadingOverlay>
                    </div>
                </DeviceFrameset>
                <DeviceFrameset
                    device="iPad Mini"
                    color="black"
                    width={600}
                    height={960}
                    landscape
                >
                    <div className="device-container">
                        <Form
                            form={form}
                            hideComponents={hideComponents}
                            options={{
                                disabled: { submit: true },
                                buttonSettings: {
                                    showSubmit: false
                                },
                                disableAlerts: true,
                                noAlerts: true,
                                language: lang,
                                i18n: formio_resourceBundles
                            }}
                        />
                    </div>
                </DeviceFrameset>
                <div className="test">
                    <DeviceFrameset device="MacBook Pro" color="gray">
                        <div className="device-container">
                            <Form
                                form={form}
                                hideComponents={hideComponents}
                                options={{
                                    disabled: { submit: true },
                                    buttonSettings: {
                                        showSubmit: false
                                    },
                                    disableAlerts: true,
                                    noAlerts: true,
                                    language: lang,
                                    i18n: formio_resourceBundles
                                }}
                            />
                        </div>
                    </DeviceFrameset>
                </div>

            </div>
            }
        </>

    );
};
export default DeviceView;
