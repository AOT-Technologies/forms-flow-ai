import React, { Component } from 'react';
export default class VideoEmbed extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            Uid: "",
            Origin: "",
        };
    }
    isValidUrl = (url) => {
        var pattern = /^(?:https?:\/\/)?(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\/.*)?$/i;
        return pattern.test(url);
    }

    urlChange = (event) => {
        let id;
        const value = event.target.value;
        const isUrl = this.isValidUrl(value);
        if (isUrl) {
            let url = new URL(value);
            const origin = url.origin;
            origin === 'https://youtu.be' ? id = url.pathname.substring(1) : id = url.searchParams.get("v");
        }
        this.setState(
            {
                value: value,
                Uid: id,
                Origin: origin
            },
            () => this.props.onChange(this.state.value)
        );
    }


    render() {
        let YoutubeId = this.state.Uid;
        let OriginName = this.state.Origin;
        return (
            <div>
                <div style={{ paddingBottom: "8px" }}>
                    <form onSubmit={this.handleSubmit}>
                        <input className='form-control' width="500" height="315" type="text" value={this.state.value} onChange={this.urlChange} />
                    </form>
                </div>
                {OriginName &&
                    <iframe width="100%" height="320" src={"https://www.youtube.com/embed/" + YoutubeId} frameBorder="0" allowFullScreen></iframe>
                }
            </div>
        );
    }
}

