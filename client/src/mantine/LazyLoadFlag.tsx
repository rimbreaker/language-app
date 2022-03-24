import React from 'react'
import { Avatar } from '@mantine/core'


const LazyFlag = ({ countryCode }: { countryCode: string }) => {
    return <Avatar
        alt="United States"
        src={`http://purecatamphetamine.github.io/country-flag-icons/1x1/${countryCode}.svg`} />


}

export default LazyFlag