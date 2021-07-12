export const SpinnerSVG = ({fill='grey',className}) => {
  return (
    <svg className={className} version="1.1" id="L5" x="0px" y="0px"
         style={{width: "100px",height:"100px",margin:"20px",display:"inline-block"}}
         viewBox="0 0 100 100" enableBackground="new 0 0 0 0" fill={fill}>
  <circle stroke="none" cx="6" cy="50" r="6">
    <animateTransform
      attributeName="transform"
      dur="1s"
      type="translate"
      values="0 15 ; 0 -15; 0 15"
      repeatCount="indefinite"
      begin="0.1"/>
  </circle>
    <circle stroke="none" cx="30" cy="50" r="6">
    <animateTransform
      attributeName="transform"
      dur="1s"
      type="translate"
      values="0 10 ; 0 -10; 0 10"
      repeatCount="indefinite"
      begin="0.2"/>
  </circle>
    <circle stroke="none" cx="54" cy="50" r="6">
    <animateTransform
      attributeName="transform"
      dur="1s"
      type="translate"
      values="0 5 ; 0 -5; 0 5"
      repeatCount="indefinite"
      begin="0.3"/>
  </circle>
</svg>)
}
