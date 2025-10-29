import SigninupBG from '../images/SigninupBG.jpg';

function SignUpInBackGround() {
  return (
    <div>
      {/* Background image */}
      <img
        src={SigninupBG}
        alt="Background"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
        }}
      />

      {/* Red overlay */}
      <div
        style={{
          position: 'absolute',
          top: '238px',
          bottom: '237px',
          left: 0,
          right: 0,
          background: 'rgba(176, 28, 41, 0.75)',
          borderRadius: '0px',
          zIndex: 1,
        }}
      ></div>
    </div>
  );
}

export default SignUpInBackGround;
