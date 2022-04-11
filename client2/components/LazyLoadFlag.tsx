import React from 'react'
import { Avatar } from '@mantine/core'
import encoding from '../util/encoding.json'

const LazyFlag = ({ countryCode }: { countryCode: string }) => {
    const regionCode = (encoding[countryCode as keyof typeof encoding] as any)?.regionCode ?? countryCode

    return <Avatar
        alt={`${countryCode}`}
        src={`http://purecatamphetamine.github.io/country-flag-icons/1x1/${regionCode}.svg`}
    />
}

export default LazyFlag