import { Box } from '@mui/system';

import { LeftGrow } from '../common/Basic';
import { useFadeOrder } from '../hooks/useFadeOrder';
import { Link } from 'react-router-dom';

import jhc from '../img/joule-home-sc.png'
import bad from '../img/badlands.jpg'
import msa from '../img/msa.png'

function Home() {
  const [ fadeOrder ] = useFadeOrder(2);
  return (
    <div>
      <LeftGrow><Box sx={{ flexGrow: 0}} style={{ marginTop: 15 }}>
        <h1>portfolio</h1>
      </Box></LeftGrow>
      
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', maxWidth: '500px' }}>
        <LeftGrow trigger={fadeOrder > 0}>
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }} style={{ gap: 15, marginTop: 15 }}>
            <h3 style={{ whiteSpace: 'nowrap' }}>joule-home</h3>
            <Link to='/joule-home'>
              <img src={jhc} alt='Graphs of energy usage' style={{ maxHeight: '25vh', objectFit: 'contain' }}></img>
            </Link>
          </Box>
        </LeftGrow>
        <LeftGrow trigger={fadeOrder > 1}>
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }} style={{ gap: 15, marginTop: 15 }}>
            <h3 style={{ whiteSpace: 'nowrap' }}>photography</h3>
            <Link to='/photography'>
              <img src={bad} alt='The badlands in black and white' style={{ maxHeight: '25vh', objectFit: 'contain' }}></img>
            </Link>
          </Box>
        </LeftGrow>
        <LeftGrow trigger={fadeOrder > 2}>
          <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }} style={{ gap: 15, marginTop: 15 }}>
            <h3 style={{ whiteSpace: 'nowrap' }}>biology</h3>
            <Link to='/biology'>
              <img src={msa} alt='Python code screenshot' style={{ maxHeight: '25vh', objectFit: 'contain' }}></img>
            </Link>
          </Box>
        </LeftGrow>
      </Box>
    </div>
  );
}

export default Home;
