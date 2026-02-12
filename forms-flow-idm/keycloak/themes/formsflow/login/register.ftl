<#import "template.ftl" as layout>
<@layout.registrationLayout; section>
    <#if section == "header">
        ${msg("registerTitle")}
    <#elseif section == "form">
        <div class="kc-register-container" id="kc-register-container">
            <!-- Left Marketing Panel - shown only when create_tenant=true in URL -->
            <div class="kc-register-marketing-panel kc-tenant-content" id="kc-tenant-marketing-panel">
                <div class="kc-marketing-content">
                    <h2 class="kc-register-hero-headline">
                        <span class="kc-headline-line1">Unlock the power of simple</span><br/>
                        <span class="kc-headline-line2">forms in your organization</span>
                    </h2>
                    
                    <!-- Three-Step Process -->
                    <div class="kc-process-steps">
                        <div class="kc-step">
                            <div class="kc-step-icon">
                                <svg width="50.086" height="50.086" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="25.0431" cy="25.0431" r="24.5431" stroke="#E5E5E5"/>
                                    <g transform="translate(15.5, 15.5)">
                                        <path d="M8.75 3.125C8.75 2.95924 8.81585 2.80027 8.93306 2.68306C9.05027 2.56585 9.20924 2.5 9.375 2.5H18.125C18.2908 2.5 18.4497 2.56585 18.5669 2.68306C18.6842 2.80027 18.75 2.95924 18.75 3.125V4.375C18.75 4.54076 18.6842 4.69973 18.5669 4.81694C18.4497 4.93415 18.2908 5 18.125 5H9.375C9.20924 5 9.05027 4.93415 8.93306 4.81694C8.81585 4.69973 8.75 4.54076 8.75 4.375V3.125ZM2.5 1.25C1.83696 1.25 1.20107 1.51339 0.732233 1.98223C0.263392 2.45107 0 3.08696 0 3.75L0 6.25C0 6.91304 0.263392 7.54893 0.732233 8.01777C1.20107 8.48661 1.83696 8.75 2.5 8.75H5C5.66304 8.75 6.29893 8.48661 6.76777 8.01777C7.23661 7.54893 7.5 6.91304 7.5 6.25V3.75C7.5 3.08696 7.23661 2.45107 6.76777 1.98223C6.29893 1.51339 5.66304 1.25 5 1.25H2.5ZM2.5 11.25C1.83696 11.25 1.20107 11.5134 0.732233 11.9822C0.263392 12.4511 0 13.087 0 13.75L0 16.25C0 16.913 0.263392 17.5489 0.732233 18.0178C1.20107 18.4866 1.83696 18.75 2.5 18.75H5C5.66304 18.75 6.29893 18.4866 6.76777 18.0178C7.23661 17.5489 7.5 16.913 7.5 16.25V13.75C7.5 13.087 7.23661 12.4511 6.76777 11.9822C6.29893 11.5134 5.66304 11.25 5 11.25H2.5ZM3.5675 6.6925C3.50944 6.7507 3.44047 6.79688 3.36454 6.82839C3.28861 6.8599 3.20721 6.87612 3.125 6.87612C3.04279 6.87612 2.96139 6.8599 2.88546 6.82839C2.80953 6.79688 2.74056 6.7507 2.6825 6.6925L1.4325 5.4425C1.37439 5.38439 1.32829 5.3154 1.29685 5.23948C1.2654 5.16356 1.24921 5.08218 1.24921 5C1.24921 4.91782 1.2654 4.83645 1.29685 4.76052C1.32829 4.6846 1.37439 4.61561 1.4325 4.5575C1.49061 4.49939 1.5596 4.45329 1.63552 4.42185C1.71145 4.3904 1.79282 4.37421 1.875 4.37421C1.95718 4.37421 2.03855 4.3904 2.11448 4.42185C2.1904 4.45329 2.25939 4.49939 2.3175 4.5575L3.125 5.36625L5.1825 3.3075C5.24061 3.24939 5.3096 3.20329 5.38552 3.17185C5.46144 3.1404 5.54282 3.12421 5.625 3.12421C5.70718 3.12421 5.78856 3.1404 5.86448 3.17185C5.9404 3.20329 6.00939 3.24939 6.0675 3.3075C6.12561 3.36561 6.17171 3.4346 6.20315 3.51052C6.2346 3.58645 6.25079 3.66782 6.25079 3.75C6.25079 3.83218 6.2346 3.91355 6.20315 3.98948C6.17171 4.0654 6.12561 4.13439 6.0675 4.1925L3.5675 6.6925ZM3.5675 16.6925C3.50944 16.7507 3.44047 16.7969 3.36454 16.8284C3.28861 16.8599 3.20721 16.8761 3.125 16.8761C3.04279 16.8761 2.96139 16.8599 2.88546 16.8284C2.80953 16.7969 2.74056 16.7507 2.6825 16.6925L1.4325 15.4425C1.31514 15.3251 1.24921 15.166 1.24921 15C1.24921 14.834 1.31514 14.6749 1.4325 14.5575C1.54986 14.4401 1.70903 14.3742 1.875 14.3742C2.04097 14.3742 2.20014 14.4401 2.3175 14.5575L3.125 15.3663L5.1825 13.3075C5.29986 13.1901 5.45903 13.1242 5.625 13.1242C5.79097 13.1242 5.95014 13.1901 6.0675 13.3075C6.18486 13.4249 6.25079 13.584 6.25079 13.75C6.25079 13.916 6.18486 14.0751 6.0675 14.1925L3.5675 16.6925ZM8.75 13.125C8.75 12.9592 8.81585 12.8003 8.93306 12.6831C9.05027 12.5658 9.20924 12.5 9.375 12.5H18.125C18.2908 12.5 18.4497 12.5658 18.5669 12.6831C18.6842 12.8003 18.75 12.9592 18.75 13.125V14.375C18.75 14.5408 18.6842 14.6997 18.5669 14.8169C18.4497 14.9342 18.2908 15 18.125 15H9.375C9.20924 15 9.05027 14.9342 8.93306 14.8169C8.81585 14.6997 8.75 14.5408 8.75 14.375V13.125ZM8.75 6.875C8.75 6.70924 8.81585 6.55027 8.93306 6.43306C9.05027 6.31585 9.20924 6.25 9.375 6.25H15.625C15.7908 6.25 15.9497 6.31585 16.0669 6.43306C16.1842 6.55027 16.25 6.70924 16.25 6.875C16.25 7.04076 16.1842 7.19973 16.0669 7.31694C15.9497 7.43415 15.7908 7.5 15.625 7.5H9.375C9.20924 7.5 9.05027 7.43415 8.93306 7.31694C8.81585 7.19973 8.75 7.04076 8.75 6.875ZM8.75 16.875C8.75 16.7092 8.81585 16.5503 8.93306 16.4331C9.05027 16.3158 9.20924 16.25 9.375 16.25H15.625C15.7908 16.25 15.9497 16.3158 16.0669 16.4331C16.1842 16.5503 16.25 16.7092 16.25 16.875C16.25 17.0408 16.1842 17.1997 16.0669 17.3169C15.9497 17.4342 15.7908 17.5 15.625 17.5H9.375C9.20924 17.5 9.05027 17.4342 8.93306 17.3169C8.81585 17.1997 8.75 17.0408 8.75 16.875Z" fill="#465BE1"/>
                                    </g>
                                </svg>
                            </div>
                            <span class="kc-step-text">Create<br/>forms</span>
                        </div>
                        <div class="kc-step-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="41" height="8" viewBox="0 0 41 8" fill="none">
                                <path d="M40.4225 4.03556C40.6178 3.8403 40.6178 3.52372 40.4225 3.32845L37.2405 0.146473C37.0453 -0.0487893 36.7287 -0.0487893 36.5334 0.146473C36.3382 0.341735 36.3382 0.658318 36.5334 0.85358L39.3619 3.68201L36.5334 6.51043C36.3382 6.7057 36.3382 7.02228 36.5334 7.21754C36.7287 7.4128 37.0453 7.4128 37.2405 7.21754L40.4225 4.03556ZM0 3.68201V4.18201H40.069V3.68201V3.18201H0V3.68201Z" fill="#D9D9D9"/>
                            </svg>
                        </div>
                        <div class="kc-step">
                            <div class="kc-step-icon">
                                <svg width="50.086" height="50.086" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="25.0431" cy="25.0431" r="24.5431" stroke="#E5E5E5"/>
                                    <g transform="translate(13.5, 13.5)">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M9 5.25C9 4.65326 9.23705 4.08097 9.65901 3.65901C10.081 3.23705 10.6533 3 11.25 3H12.75C13.3467 3 13.919 3.23705 14.341 3.65901C14.7629 4.08097 15 4.65326 15 5.25V6.75C15 7.34674 14.7629 7.91903 14.341 8.34099C13.919 8.76295 13.3467 9 12.75 9V10.5H16.5C16.6989 10.5 16.8897 10.579 17.0303 10.7197C17.171 10.8603 17.25 11.0511 17.25 11.25V12.75C17.25 12.9489 17.171 13.1397 17.0303 13.2803C16.8897 13.421 16.6989 13.5 16.5 13.5C16.3011 13.5 16.1103 13.421 15.9697 13.2803C15.829 13.1397 15.75 12.9489 15.75 12.75V12H8.25V12.75C8.25 12.9489 8.17098 13.1397 8.03033 13.2803C7.88968 13.421 7.69891 13.5 7.5 13.5C7.30109 13.5 7.11032 13.421 6.96967 13.2803C6.82902 13.1397 6.75 12.9489 6.75 12.75V11.25C6.75 11.0511 6.82902 10.8603 6.96967 10.7197C7.11032 10.579 7.30109 10.5 7.5 10.5H11.25V9C10.6533 9 10.081 8.76295 9.65901 8.34099C9.23705 7.91903 9 7.34674 9 6.75V5.25ZM12.75 7.5C12.9489 7.5 13.1397 7.42098 13.2803 7.28033C13.421 7.13968 13.5 6.94891 13.5 6.75V5.25C13.5 5.05109 13.421 4.86032 13.2803 4.71967C13.1397 4.57902 12.9489 4.5 12.75 4.5H11.25C11.0511 4.5 10.8603 4.57902 10.7197 4.71967C10.579 4.86032 10.5 5.05109 10.5 5.25V6.75C10.5 6.94891 10.579 7.13968 10.7197 7.28033C10.8603 7.42098 11.0511 7.5 11.25 7.5H12.75ZM4.5 17.25C4.5 16.6533 4.73705 16.081 5.15901 15.659C5.58097 15.2371 6.15326 15 6.75 15H8.25C8.84674 15 9.41903 15.2371 9.84099 15.659C10.2629 16.081 10.5 16.6533 10.5 17.25V18.75C10.5 19.3467 10.2629 19.919 9.84099 20.341C9.41903 20.7629 8.84674 21 8.25 21H6.75C6.15326 21 5.58097 20.7629 5.15901 20.341C4.73705 19.919 4.5 19.3467 4.5 18.75V17.25ZM6.75 16.5C6.55109 16.5 6.36032 16.579 6.21967 16.7197C6.07902 16.8603 6 17.0511 6 17.25V18.75C6 18.9489 6.07902 19.1397 6.21967 19.2803C6.36032 19.421 6.55109 19.5 6.75 19.5H8.25C8.44891 19.5 8.63968 19.421 8.78033 19.2803C8.92098 19.1397 9 18.9489 9 18.75V17.25C9 17.0511 8.92098 16.8603 8.78033 16.7197C8.63968 16.579 8.44891 16.5 8.25 16.5H6.75ZM13.5 17.25C13.5 16.6533 13.7371 16.081 14.159 15.659C14.581 15.2371 15.1533 15 15.75 15H17.25C17.8467 15 18.419 15.2371 18.841 15.659C19.2629 16.081 19.5 16.6533 19.5 17.25V18.75C19.5 19.3467 19.2629 19.919 18.841 20.341C18.419 20.7629 17.8467 21 17.25 21H15.75C15.1533 21 14.581 20.7629 14.159 20.341C13.7371 19.919 13.5 19.3467 13.5 18.75V17.25ZM15.75 16.5C15.5511 16.5 15.3603 16.579 15.2197 16.7197C15.079 16.8603 15 17.0511 15 17.25V18.75C15 18.9489 15.079 19.1397 15.2197 19.2803C15.3603 19.421 15.5511 19.5 15.75 19.5H17.25C17.4489 19.5 17.6397 19.421 17.7803 19.2803C17.921 19.1397 18 18.9489 18 18.75V17.25C18 17.0511 17.921 16.8603 17.7803 16.7197C17.6397 16.579 17.4489 16.5 17.25 16.5H15.75Z" fill="#465BE1"/>
                                    </g>
                                </svg>
                            </div>
                            <span class="kc-step-text">Manage<br/>flows</span>
                        </div>
                        <div class="kc-step-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" width="41" height="8" viewBox="0 0 41 8" fill="none">
                                <path d="M40.4225 4.03556C40.6178 3.8403 40.6178 3.52372 40.4225 3.32845L37.2405 0.146473C37.0453 -0.0487893 36.7287 -0.0487893 36.5334 0.146473C36.3382 0.341735 36.3382 0.658318 36.5334 0.85358L39.3619 3.68201L36.5334 6.51043C36.3382 6.7057 36.3382 7.02228 36.5334 7.21754C36.7287 7.4128 37.0453 7.4128 37.2405 7.21754L40.4225 4.03556ZM0 3.68201V4.18201H40.069V3.68201V3.18201H0V3.68201Z" fill="#D9D9D9"/>
                            </svg>
                        </div>
                        <div class="kc-step">
                            <div class="kc-step-icon">
                                <svg width="50.086" height="50.086" viewBox="0 0 51 51" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="25.0431" cy="25.0431" r="24.5431" stroke="#E5E5E5"/>
                                    <g transform="translate(17.5, 17.5)">
                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M15.6887 2.70886L7.51154 11.6847C7.09749 12.1392 6.42173 12.1392 6.00768 11.6847L2.33038 7.64826C1.91633 7.19377 1.91633 6.452 2.33038 5.99751L2.61319 5.68707C3.02724 5.23258 3.703 5.23258 4.11705 5.68707L6.75998 8.58815L13.9028 0.747671C14.3168 0.29318 14.9926 0.29318 15.4067 0.747671L15.6895 1.05811C16.1035 1.5126 16.1035 2.25436 15.6895 2.70886H15.6887ZM14.2489 6.58574C14.0685 6.58574 13.9224 6.7461 13.9224 6.94419V14.2898C13.9224 14.837 13.5169 15.282 13.0185 15.282L1.557 15.2829C1.05857 15.2829 0.653123 14.8378 0.653123 14.2907V1.70906C0.653123 1.16195 1.05857 0.716894 1.557 0.716894H12.1763C12.3568 0.716894 12.5029 0.556535 12.5029 0.358447C12.5029 0.160359 12.3568 0 12.1763 0L1.557 0.000857535C0.698421 0.000857535 0 0.767497 0 1.70993V14.2909C0 15.2334 0.698421 16 1.557 16H13.0185C13.8771 16 14.5755 15.2334 14.5755 14.2909V6.94526C14.5755 6.74717 14.4294 6.58682 14.2489 6.58682L14.2489 6.58574Z" fill="#465BE1"/>
                                    </g>
                                </svg>
                            </div>
                            <span class="kc-step-text">Create<br/>tasks</span>
                        </div>
                    </div>
                    
                    <!-- Benefits List -->
                    <div class="kc-benefits-list">
                        <div class="kc-benefit-item">
                            <svg class="kc-checkmark-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M15.6887 2.70886L7.51154 11.6847C7.09749 12.1392 6.42173 12.1392 6.00768 11.6847L2.33038 7.64826C1.91633 7.19377 1.91633 6.452 2.33038 5.99751L2.61319 5.68707C3.02724 5.23258 3.703 5.23258 4.11705 5.68707L6.75998 8.58815L13.9028 0.747671C14.3168 0.29318 14.9926 0.29318 15.4067 0.747671L15.6895 1.05811C16.1035 1.5126 16.1035 2.25436 15.6895 2.70886H15.6887ZM14.2489 6.58574C14.0685 6.58574 13.9224 6.7461 13.9224 6.94419V14.2898C13.9224 14.837 13.5169 15.282 13.0185 15.282L1.557 15.2829C1.05857 15.2829 0.653123 14.8378 0.653123 14.2907V1.70906C0.653123 1.16195 1.05857 0.716894 1.557 0.716894H12.1763C12.3568 0.716894 12.5029 0.556535 12.5029 0.358447C12.5029 0.160359 12.3568 0 12.1763 0L1.557 0.000857535C0.698421 0.000857535 0 0.767497 0 1.70993V14.2909C0 15.2334 0.698421 16 1.557 16H13.0185C13.8771 16 14.5755 15.2334 14.5755 14.2909V6.94526C14.5755 6.74717 14.4294 6.58682 14.2489 6.58682L14.2489 6.58574Z" fill="#465BE1"/>
                            </svg>
                            <span class="kc-benefit-item__label">Easy setup, no coding required</span>
                        </div>
                        <div class="kc-benefit-item">
                            <svg class="kc-checkmark-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M15.6887 2.70886L7.51154 11.6847C7.09749 12.1392 6.42173 12.1392 6.00768 11.6847L2.33038 7.64826C1.91633 7.19377 1.91633 6.452 2.33038 5.99751L2.61319 5.68707C3.02724 5.23258 3.703 5.23258 4.11705 5.68707L6.75998 8.58815L13.9028 0.747671C14.3168 0.29318 14.9926 0.29318 15.4067 0.747671L15.6895 1.05811C16.1035 1.5126 16.1035 2.25436 15.6895 2.70886H15.6887ZM14.2489 6.58574C14.0685 6.58574 13.9224 6.7461 13.9224 6.94419V14.2898C13.9224 14.837 13.5169 15.282 13.0185 15.282L1.557 15.2829C1.05857 15.2829 0.653123 14.8378 0.653123 14.2907V1.70906C0.653123 1.16195 1.05857 0.716894 1.557 0.716894H12.1763C12.3568 0.716894 12.5029 0.556535 12.5029 0.358447C12.5029 0.160359 12.3568 0 12.1763 0L1.557 0.000857535C0.698421 0.000857535 0 0.767497 0 1.70993V14.2909C0 15.2334 0.698421 16 1.557 16H13.0185C13.8771 16 14.5755 15.2334 14.5755 14.2909V6.94526C14.5755 6.74717 14.4294 6.58682 14.2489 6.58682L14.2489 6.58574Z" fill="#465BE1"/>
                            </svg>
                            <span class="kc-benefit-item__label">Explore premium enterprise features with zero vendor lock-in</span>
                        </div>
                        <div class="kc-benefit-item">
                            <svg class="kc-checkmark-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fill-rule="evenodd" clip-rule="evenodd" d="M15.6887 2.70886L7.51154 11.6847C7.09749 12.1392 6.42173 12.1392 6.00768 11.6847L2.33038 7.64826C1.91633 7.19377 1.91633 6.452 2.33038 5.99751L2.61319 5.68707C3.02724 5.23258 3.703 5.23258 4.11705 5.68707L6.75998 8.58815L13.9028 0.747671C14.3168 0.29318 14.9926 0.29318 15.4067 0.747671L15.6895 1.05811C16.1035 1.5126 16.1035 2.25436 15.6895 2.70886H15.6887ZM14.2489 6.58574C14.0685 6.58574 13.9224 6.7461 13.9224 6.94419V14.2898C13.9224 14.837 13.5169 15.282 13.0185 15.282L1.557 15.2829C1.05857 15.2829 0.653123 14.8378 0.653123 14.2907V1.70906C0.653123 1.16195 1.05857 0.716894 1.557 0.716894H12.1763C12.3568 0.716894 12.5029 0.556535 12.5029 0.358447C12.5029 0.160359 12.3568 0 12.1763 0L1.557 0.000857535C0.698421 0.000857535 0 0.767497 0 1.70993V14.2909C0 15.2334 0.698421 16 1.557 16H13.0185C13.8771 16 14.5755 15.2334 14.5755 14.2909V6.94526C14.5755 6.74717 14.4294 6.58682 14.2489 6.58682L14.2489 6.58574Z" fill="#465BE1"/>
                            </svg>
                            <span class="kc-benefit-item__label">30-Day trial period, no credit card required</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Right Registration Form -->
            <div class="kc-register-form-panel">
                <form id="kc-register-form" class="${properties.kcFormClass!}" action="${url.registrationAction}" method="post">
            <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('firstName',properties.kcFormGroupErrorClass!)}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="firstName" class="${properties.kcLabelClass!}">${msg("firstName")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="text" id="firstName" class="${properties.kcInputClass!}" name="firstName" value="${(register.formData.firstName!'')}" />
                </div>
            </div>

            <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('lastName',properties.kcFormGroupErrorClass!)}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="lastName" class="${properties.kcLabelClass!}">${msg("lastName")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="text" id="lastName" class="${properties.kcInputClass!}" name="lastName" value="${(register.formData.lastName!'')}" />
                </div>
            </div>

            <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('email',properties.kcFormGroupErrorClass!)}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="email" class="${properties.kcLabelClass!}">${msg("email")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="text" id="email" class="${properties.kcInputClass!}" name="email" value="${(register.formData.email!'')}" autocomplete="email" />
                </div>
            </div>

            <#if !realm.registrationEmailAsUsername>
            <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('username',properties.kcFormGroupErrorClass!)}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="username" class="${properties.kcLabelClass!}">${msg("username")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="text" id="username" class="${properties.kcInputClass!}" name="username" value="${(register.formData.username!'')}" autocomplete="username" />
                </div>
            </div>
            </#if>

            <#if passwordRequired>
            <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('password',properties.kcFormGroupErrorClass!)}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="password" class="${properties.kcLabelClass!}">${msg("password")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="password" id="password" class="${properties.kcInputClass!}" name="password" autocomplete="new-password"/>
                </div>
            </div>

            <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('password-confirm',properties.kcFormGroupErrorClass!)}">
                <div class="${properties.kcLabelWrapperClass!}">
                    <label for="password-confirm" class="${properties.kcLabelClass!}">${msg("passwordConfirm")}</label>
                </div>
                <div class="${properties.kcInputWrapperClass!}">
                    <input type="password" id="password-confirm" class="${properties.kcInputClass!}" name="password-confirm" />
                </div>
            </div>
            </#if>

            <#if recaptchaRequired??>
            <div class="form-group">
                <div class="${properties.kcInputWrapperClass!}">
                    <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                </div>
            </div>
            </#if>

            <div class="${properties.kcFormGroupClass!}">
                <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                    <div class="${properties.kcFormOptionsWrapperClass!}">
                        <span><a href="${url.loginUrl}">${msg("backToLogin")?no_esc}</a></span>
                    </div>
                </div>

                <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <input id="kc-register-submit" class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" type="submit" value="${msg("doRegister")}"/>
                </div>
            </div>

            <input type="hidden" id="user.attributes.tenantKey" name="user.attributes.tenantKey" value=""/>
                </form>
            </div>
        </div>

        <!-- extracting tenantKey from client-id -->
        <script>
            <!-- get url-->
            function getUrlParameter(name) {
                name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
                var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
                var results = regex.exec(location.search);
                if (results === null || results[1] == null) {
                    return '';
                }
                return decodeURIComponent(results[1].replace(/\+/g, ' '));
            }

            var clientId = getUrlParameter('client_id');
            var tenantKey = '';
            var createTenant = (getUrlParameter('create_tenant') || '').toLowerCase() === 'true';

            if (clientId !== 'forms-flow-web') {
                tenantKey = clientId.split('-forms-flow-web')[0];
                var tenantKeyEl = document.getElementById('user.attributes.tenantKey');
                if (tenantKeyEl) {
                    tenantKeyEl.value = tenantKey;
                }
            }

            // Body classes (registration-page, tenant-registration-page) are set in template.ftl
            // before first paint to avoid flash. Here we only toggle panel/container and card.
            var container = document.getElementById('kc-register-container');
            var tenantPanel = document.getElementById('kc-tenant-marketing-panel');
            var cardPf = document.querySelector('.card-pf');
            if (cardPf) {
                cardPf.classList.add('registration-card');
            }
            if (createTenant) {
                if (tenantPanel) {
                    tenantPanel.classList.remove('kc-tenant-content-hidden');
                }
                if (container) {
                    container.classList.add('kc-register-container--tenant');
                }
            } else {
                if (tenantPanel) {
                    tenantPanel.classList.add('kc-tenant-content-hidden');
                }
                if (container) {
                    container.classList.remove('kc-register-container--tenant');
                }
            }

            // Disable register button on submit to avoid duplicate submissions during long tenant creation.
            document.addEventListener('DOMContentLoaded', function () {
                var form = document.getElementById('kc-register-form');
                if (!form) {
                    return;
                }
                form.addEventListener('submit', function () {
                    var submitButton = document.getElementById('kc-register-submit');
                    if (submitButton) {
                        submitButton.disabled = true;
                    }
                });
            });
        </script>
    <#elseif section == "socialProviders">
        <#if realm.password && social?? && social.providers?has_content>
            <div id="kc-social-providers" class="${properties.kcFormSocialAccountSectionClass!}">
                <hr/>
                <#if numberOfIdps??>
                    <#if numberOfIdps gt 0>
                        <h2>${msg("identity-provider-login-label")}</h2>
                    </#if>
                <#else>
                    <#if social.providers??>
                        <h2>${msg("identity-provider-login-label")}</h2>
                    </#if>
                </#if>
                <ul class="${properties.kcFormSocialAccountListClass!} <#if social.providers?size gt 3>${properties.kcFormSocialAccountListGridClass!}</#if>">
                    <#-- Check if numberOfIdps is present -->
                    <#if numberOfIdps??>
                        <#list social.providers as sp>
                            <#list identityProviders as idp>
                                <#if sp.alias == idp.alias>
                                <a id="social-${sp.alias}" class="${properties.kcFormSocialAccountListButtonClass!} <#if identityProviders?size gt 3>${properties.kcFormSocialAccountGridItem!}</#if>"
                                    type="button" href="${sp.loginUrl}">
                                    <#if sp.iconClasses?has_content>
                                        <i class="${properties.kcCommonLogoIdP!} ${sp.iconClasses!}" aria-hidden="true"></i>
                                        <span class="${properties.kcFormSocialAccountNameClass!} kc-social-icon-text">${sp.displayName!}</span>
                                    <#else>
                                        <span class="${properties.kcFormSocialAccountNameClass!}">${sp.displayName!}</span>
                                    </#if>
                                </a>
                                </#if>
                            </#list>    
                        </#list>
                    <#else>
                        <#list social.providers as p>
                            <li>
                                <a id="social-${p.alias}" class="${properties.kcFormSocialAccountListButtonClass!} <#if social.providers?size gt 3>${properties.kcFormSocialAccountGridItem!}</#if>"
                                        type="button" href="${p.loginUrl}">
                                    <#if p.iconClasses?has_content>
                                        <i class="${properties.kcCommonLogoIdP!} ${p.iconClasses!}" aria-hidden="true"></i>
                                        <span class="${properties.kcFormSocialAccountNameClass!} kc-social-icon-text">${p.displayName!}</span>
                                    <#else>
                                        <span class="${properties.kcFormSocialAccountNameClass!}">${p.displayName!}</span>
                                    </#if>
                                </a>
                            </li>
                        </#list>
                    </#if>
                </ul>
            </div>
        </#if>
    </#if>
</@layout.registrationLayout>