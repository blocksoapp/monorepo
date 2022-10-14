import React from 'react'
import { Form } from 'react-bootstrap'

function FormSocialLinks({ profile, setProfile }) {

         // Form State Update
         const handleSocialChange = (event) => {
            const { name, value } = event.target
            setProfile(prevValue => {
                return {
                    ...prevValue,
                    socials: {...prevValue.socials, [name]: value}
                }
            })
            console.log(profile)
        } 

  return (
    <div className="">
            <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Website</Form.Label>
            <Form.Control onChange={handleSocialChange} name="website" value={profile.socials.website} type="text" size="sm" placeholder="" />
            </Form.Group>


            <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Twitter</Form.Label>
            <Form.Control onChange={handleSocialChange} name="twitter" value={profile.socials.twitter} type="text" size="sm" placeholder="" />
            </Form.Group>

            <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Telegram</Form.Label>
            <Form.Control onChange={handleSocialChange} name="telegram" value={profile.socials.telegram} type="text" size="sm" placeholder="" />
            </Form.Group>

            <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Discord</Form.Label>
            <Form.Control onChange={handleSocialChange} name="discord" value={profile.socials.discord} type="text" size="sm" placeholder="" />
            </Form.Group>



            <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Opensea</Form.Label>
            <Form.Control onChange={handleSocialChange} name="opensea" value={profile.socials.opensea} type="text" size="sm" placeholder="" />
            </Form.Group>

            <Form.Group className="mb-3">
                <Form.Label className="fw-bold">LooksRare</Form.Label>
                <Form.Control onChange={handleSocialChange} name="looksrare" value={profile.socials.looksrare} type="text" size="sm" placeholder="" />
            </Form.Group>

            <Form.Group>
                <Form.Label className="fw-bold">Snapshot</Form.Label>
                <Form.Control onChange={handleSocialChange} name="snapshot" value={profile.socials.snapshot} type="text" size="sm" placeholder="" />
            </Form.Group>

            <Form.Text className="text-muted">
            Please use a valid link (e.g: https://blockso.fun)
            </Form.Text>
</div>
  )
}

export default FormSocialLinks