// New Signup Start - Beautiful Role Selection
import { RoleSelection } from '../../components/Onboarding';
import { SEO } from '../../components/SEO';

export function SignupStart() {
  return (
    <>
      <SEO title="Sign Up | EquityMD" noindex={true} />
      <RoleSelection />
    </>
  );
}
